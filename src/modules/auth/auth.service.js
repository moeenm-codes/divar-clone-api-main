const autoBind = require("auto-bind");
const UserModel = require("../user/user.model");
const createHttpError = require("http-errors");
const { AuthMessage } = require("./auth.messages");
const { randomInt } = require("crypto");
require("dotenv").config();
const jwt = require("jsonwebtoken");

class AuthService {
  #model;
  constructor() {
    autoBind(this);
    this.#model = UserModel;
  }

  async sendOTP(mobile) {
    const user = await this.#model.findOne({ mobile });
    const now = new Date().getTime();
    const otp = {
      code: randomInt(10000, 99999),
      expiresIn: now + 1000 * 60 * 2, // ۲ دقیقه
    };

    if (!user) {
      const newUser = await this.#model.create({
        mobile,
        otp,
        role: mobile === "09180009988" ? "ADMIN" : "USER", // اولین بار که ثبت میشه
      });
      console.log(otp.code);
      return newUser;
    }

    user.otp = otp;
    await user.save();
    console.log(otp.code);
    return user;
  }

  async checkOTP(mobile, code) {
    const user = await this.#model.findOne({ mobile });
    if (!user) throw new createHttpError.NotFound(AuthMessage.NotFound);

    const now = new Date().getTime();

    if (!user.otp || user.otp.expiresIn < now) {
      throw new createHttpError.Unauthorized(AuthMessage.OtpCodeExpired);
    }

    if (user.otp.code.toString() !== code.toString().trim())
      throw new createHttpError.Unauthorized(AuthMessage.OtpCodeIsIncorrect);

    // تأیید موبایل
    if (!user.verifiedMobile) {
      user.verifiedMobile = true;
    }

    // این قسمت مهم: اگر شماره ادمین بود، نقش رو ADMIN کن (حتی اگر قبلاً USER بود)
    if (mobile === "09180009988") {
      user.role = "ADMIN";
    }

    const accessToken = this.signToken({ mobile, id: user._id });
    const refreshToken = this.signToken({ mobile, id: user._id }, "1y");

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken,
      role: user.role, // حالا همیشه درست برمی‌گرده
    };
  }

  async checkExistByMobile(mobile) {
    const user = await this.#model.findOne({ mobile });
    if (!user) throw new createHttpError.NotFound(AuthMessage.NotFound);
    return user;
  }

  async checkRefreshToken(refreshToken) {
    if (!refreshToken)
      throw new createHttpError.Unauthorized("لطفاً مجدد وارد شوید");

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
    if (typeof payload !== "object" || !payload.id) {
      throw new createHttpError.Unauthorized("توکن نامعتبر است");
    }

    const user = await this.#model.findById(payload.id);
    if (!user) throw new createHttpError.Unauthorized("کاربر یافت نشد");

    const accessToken = this.signToken({ mobile: user.mobile, id: user._id });
    const newRefreshToken = this.signToken(
      { mobile: user.mobile, id: user._id },
      "1y"
    );

    user.accessToken = accessToken;
    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  }

  signToken(payload, expiresIn = "30d") {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn });
  }

  async clearToken(userId) {
    await this.#model.updateOne(
      { _id: userId },
      { $unset: { accessToken: 1, refreshToken: 1 } }
    );
  }
}

module.exports = new AuthService();
