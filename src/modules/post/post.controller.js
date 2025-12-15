const autoBind = require("auto-bind");
const { PostMessage } = require("./post.message");
const HttpCodes = require("http-codes");
const postService = require("./post.service");
const CategoryModel = require("../category/category.model");
const createHttpError = require("http-errors");
const { Types } = require("mongoose");
const { removePropertyInObject } = require("../../common/utils/functions");
const { getAddressDetail } = require("../../common/utils/http");
const utf8 = require("utf8");
class PostController {
  #service;
  success_message;
  constructor() {
    autoBind(this);
    this.#service = postService;
  }
  async createPostPage(req, res, next) {
    try {
      let { slug } = req.query;
      let showBack = false;
      let match = { parent: null };
      let options, category;
      if (slug) {
        slug = slug.trim();
        category = await CategoryModel.findOne({ slug });
        if (!category) throw new createHttpError.NotFound(PostMessage.NotFound);
        options = await this.#service.getCategoryOptions(category._id);
        if (options.length === 0) options = null;
        showBack = true;
        match = {
          parent: category._id,
        };
      }
      const categories = await CategoryModel.aggregate([
        {
          $match: match,
        },
      ]);
      res.json({
        categories,
        showBack,
        category: category?._id.toString(),
        options,
      });
    } catch (error) {
      next(error);
    }
  }
  async create(req, res, next) {
    try {
      const userId = req.user._id;
      const images = req?.files?.map((image) => image?.path?.slice(7));
      const {
        title_post: title,
        description: content,
        lat,
        lng,
        category,
        amount,
      } = req.body;
      const options = removePropertyInObject(req.body, [
        "amount",
        "title_post",
        "description",
        "lat",
        "lng",
        "category",
        "images",
      ]);
      for (let key in options) {
        let value = options[key];
        delete options[key];
        key = utf8.decode(key);
        options[key] = value;
      }
      const { address, province, city, district } = await getAddressDetail(
        lat,
        lng
      );
      await this.#service.create({
        userId,
        title,
        amount,
        content,
        coordinate: [lat, lng],
        category: new Types.ObjectId(category),
        images,
        options,
        address,
        province,
        city,
        district,
      });
      return res.json({
        message: PostMessage.Created,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
  async findMyPosts(req, res, next) {
    try {
      const userId = req.user._id;
      const posts = await this.#service.find(userId);
      res.json({
        posts,
        count: posts.length,
      });
    } catch (error) {
      next(error);
    }
  }
  async remove(req, res, next) {
    try {
      const { id } = req.params;
      await this.#service.remove(id);
      return res.json({
        message: PostMessage.Deleted,
      });
    } catch (error) {
      next(error);
    }
  }
  async showPost(req, res, next) {
    try {
      const { id } = req.params;
      const post = await this.#service.checkExist(id);
      res.locals.layout = "./layouts/website/main.ejs";
      res.json({
        post,
      });
    } catch (error) {
      next(error);
    }
  }
  async postList(req, res, next) {
    try {
      const query = req.query;
      const posts = await this.#service.findAll(query);
      res.json({
        posts,
      });
    } catch (error) {
      next(error);
    }
  }
  // post.controller.js - متد updatePost کامل

  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      // چک کردن وجود پست و مالکیت
      const post = await this.#service.checkExistAndOwnership(id, userId);

      // عکس‌های جدیدی که الان آپلود شدن
      const newImages = req?.files?.map((image) => image?.path?.slice(7)) || [];

      const {
        title_post: title,
        description: content,
        lat,
        lng,
        category,
        amount,
        city,
        existingImages, // آرایه JSON که از فرانت میاد
      } = req.body;

      const updateData = {};

      // فیلدهای معمولی
      if (title) updateData.title = title;
      if (content) updateData.content = content;
      if (amount !== undefined) updateData.amount = amount;
      if (category) updateData.category = new Types.ObjectId(category);
      if (city) updateData.city = city;

      // ⭐⭐⭐ بخش کلیدی: مدیریت عکس‌ها
      let finalImages = [];

      // اگه existingImages فرستاده شده بود، پارسش کن
      if (existingImages) {
        try {
          const parsedExisting = JSON.parse(existingImages);
          // فقط عکس‌هایی که واقعاً string هستن رو بگیر
          finalImages = Array.isArray(parsedExisting)
            ? parsedExisting.filter(
                (img) => typeof img === "string" && img.length > 0
              )
            : [];
        } catch (e) {
          console.log("خطا در پارس existingImages:", e.message);
          finalImages = [];
        }
      }

      // عکس‌های جدید رو به آخر اضافه کن
      if (newImages.length > 0) {
        finalImages = [...finalImages, ...newImages];
      }

      // همیشه آرایه عکس‌ها رو آپدیت کن (حتی اگه خالی باشه)
      updateData.images = finalImages;

      // اگر lat و lng هم فرستاده شده، آدرس جدید بگیر
      if (lat && lng) {
        const {
          address,
          province,
          city: fetchedCity,
          district,
        } = await getAddressDetail(lat, lng);
        updateData.coordinate = [lat, lng];
        updateData.address = address;
        updateData.province = province;
        if (!city) updateData.city = fetchedCity; // اگه city نفرستاده شده، از API بگیر
        updateData.district = district;
      }

      // آپدیت پست
      const updatedPost = await this.#service.update(id, updateData);

      return res.json({
        message: "آگهی با موفقیت ویرایش شد",
        data: updatedPost,
      });
    } catch (error) {
      console.error("خطا در updatePost:", error);
      next(error);
    }
  }
}

module.exports = new PostController();
