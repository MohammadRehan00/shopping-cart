const mongoose = require("mongoose");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const userModel = require("../models/userModel");

const validator = require("../utils/validator");

const createCart = async function (req, res) {
  try {
    const requestBody = req.body;
    const userId = req.params.userId;
    const { cartId, productId } = requestBody;

    if (!validator.isValidRequestBody(requestBody)) {
      res.status(400).send({ staus: false, msg: "requestBody is mandatory " });
      return;
    }
    if (!validator.isValidObjectId(userId)) {
      res
        .status(400)
        .send({ status: false, msg: `userId should be valid Id ` });
      return;
    }
    const findUser = await userModel.findById({ _id: userId });
    if (!findUser) {
      res
        .status(400)
        .send({ status: false, alert: `user doesn't exist by this ${userId}` });
      return;
    }
    if (!validator.isValidObjectId(productId)) {
      res
        .status(400)
        .send({ status: false, msg: `productId should be valid Id ` });
      return;
    }
    const findProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    // const findProduct = await productModel.findOne({_id: req.body.items[0]['productId'], isDeleted:false});
    if (!findProduct) {
      res
        .status(400)
        .send({
          status: false,
          alert: `product doesn't exist by this id ${productId}`,
        });
      return;
    }
    if (!cartId) {
      const findUserInCart = await cartModel.findOne({ userId: userId });
      if (findUserInCart) {
        res.status(400).send({ status: false, message: `cart already exist` });
        return;
      }
      const cartData = {
        userId,
        items: [
          {
            productId: findProduct._id,
            quantity: 1,
          },
        ],
        totalPrice: findProduct.price,
        totalItems: 1,
      };
      const cartCreate = await cartModel.create(cartData);
      cartCreate.items["productId"] = findProduct;
      return res
        .status(201)
        .send({ status: true, message: "success", data: cartCreate });
    }
    if (!validator.isValidObjectId(cartId)) {
      return res
        .status(400)
        .send({ status: false, message: `${cartId} is not a valid cartId id` });
    }
    const cart = await cartModel.findOne({ userId: userId });
    if (cart) {
      const cartNotFound = await cartModel.findOne({
        _id: cartId,
        userId: userId,
      });
      if (!cartNotFound) {
        return res
          .status(404)
          .send({ status: false, message: `cart does not exit` });
      }
      let productPrice = findProduct.price;
      console.log("productPrice", productPrice);

      let productIdInCart = cart.items[0]["productId"];
      console.log("productIdInCart", productIdInCart);

      let quantityInCart = cart["items"][0]["quantity"];
      console.log("quantityInCart", quantityInCart);

      let totalPriceInCart = cart.totalPrice;
      console.log("totalPriceInCart", totalPriceInCart);

      // let totalItemInCart = cart["items"].length
      // console.log("totalItemInCart", totalItemInCart)

      const checkProductInCart = await cartModel.findOne({
        _id: cartId,
        "items.productId": productId,
      });
      console.log("checkProductInCart", checkProductInCart);
      if (checkProductInCart) {
        const increaseQuantity = await cartModel.findOneAndUpdate(
          { _id: cartId, "items.productId": productId },
          { $inc: { "items.$.quantity": Number(+1) } }
        );
        console.log("increaseQuantity", increaseQuantity); //{ $inc: { 'items.$.quantity': Number(-1) } }

        const increaseTotalPrice = await cartModel.findOneAndUpdate(
          { _id: cartId, "items.productId": productId },
          { totalPrice: totalPriceInCart + productPrice },
          { new: true }
        );
        console.log("increaseTotalPrice", increaseTotalPrice);

        return res
          .status(201)
          .send({ status: true, message: "success", data: increaseTotalPrice });
      } else {
        if (!checkProductInCart) {
          const checkProductInCart2 = await cartModel.findOne({
            _id: cartId,
            userId: userId,
          });
          console.log("checkProductInCart2", checkProductInCart2);

          if (checkProductInCart2) {
            // const isItemAdded = cart.items.find(c => c['productId'] == productId)

            const addNewProduct = await cartModel.updateOne(
              { _id: cartId },
              {
                $push: {
                  items: [
                    { productId: findProduct._id, quantity: quantityInCart },
                  ],
                },
              }
            );
            console.log("addNewProduct", addNewProduct);

            const increaseQuantity = await cartModel.findOneAndUpdate(
              { _id: cartId, "items.productId": productId },
              { $inc: { "items.$.quantity": Number(+1) } }
            );
            console.log("increaseQuantity", increaseQuantity); //{ $inc: { 'items.$.quantity': Number(-1) } }

            const increaseTotalPrice = await cartModel.findOneAndUpdate(
              { _id: cartId, "items.productId": productId },
              { totalPrice: totalPriceInCart + productPrice },
              { new: true }
            );
            console.log("increaseTotalPrice", increaseTotalPrice);

            return res
              .status(201)
              .send({
                status: true,
                message: "success",
                data: increaseTotalPrice,
              });
          }
        }
      }
    }
  } catch (error) {
    res.status(500).send({ status: false, data: error.message });
  }
};

//update cart

const updateCart = async function (req, res) {
  try {
    let requestBody = req.body;
    let userId = req.params.userId;
    if (!validator.isValidObjectId(userId)) {
      res
        .status(400)
        .send({ status: false, message: "please enter valid userId details" });
      return;
    }
    if (!validator.isValidRequestBody(requestBody)) {
      res
        .status(400)
        .send({ status: false, message: "please enter valid details" });
      return;
    }
    let { cartId, productId, removeProduct } = requestBody;

    //USER FIND(EXIST)
    const findUser = await userModel.findOne({ userId: userId });
    if (!findUser) {
      res.status(400).send({ status: false, message: "user dose not exist" });
      return;
    }
    if (!validator.isValid(cartId)) {
      res.status(400).send({ status: false, message: "enter cart id" });
      return;
    }
    if (!validator.isValidObjectId(cartId)) {
      res.status(400).send({ status: false, message: "cart id  is not valid" });
      return;
    }
    // CART FIND (EXIST)
    const findCart = await cartModel.findOne({ _id: cartId });
    if (!findCart) {
      res.status(400).send({ status: false, message: "cart dose not exist" });
      return;
    }
    if (!validator.isValid(productId)) {
      res.status(400).send({ status: false, message: "enter product id" });
      return;
    }
    if (!validator.isValidObjectId(productId)) {
      res
        .status(400)
        .send({ status: false, message: "productId is not valid" });
      return;
    }
    //PRODUCT FIND(EXIST)
    const findProduct = await productModel.findOne({
      _id: productId,
      isDeleted: false,
    });
    if (!findProduct) {
      res
        .status(400)
        .send({ status: false, message: "product dose not exist" });
      return;
    }
    if (!validator.isValid(removeProduct)) {
      res
        .status(400)
        .send({ status: false, message: "remove product is required" });
      return;
    }
    //FIND PRICE OF PRODUCT
    let productPrice = findProduct.price;
    console.log(productPrice);
    let findUserCart = await cartModel.findOne({ _id: cartId });
    let findItems = findCart.items;
    console.log(findItems.length, "findItems.length");
    let itemArray = findUserCart.items[0].quantity; // quantity of product
    console.log(itemArray, "itemArray");
    let totalPrice = productPrice * itemArray; //product + quantitity price
    console.log(totalPrice, "totalPrice");
    let priceInCart = findUserCart.totalPrice; // total price in cart
    console.log(priceInCart, "priceInCart");
    //  console.log(itemArray)
    let singleProductPrice = totalPrice / itemArray; //single product price
    console.log("singleProductPrice", singleProductPrice);
    let findProductInCart = await cartModel.findOne({
      _id: cartId,
      "items.productId": productId,
    });
    console.log("findProductInCart", findProductInCart);
    if (!findProductInCart) {
      res
        .status(400)
        .send({ status: false, message: "product dose not exist in cart " });
      return;
    }
    if (!(removeProduct === 1 || removeProduct === 0)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "removeProduct key must contain 0 or 1 ",
        });
    }
    if (removeProduct === 1) {
      console.log("hy hy hy remove product"); // object of object ki nested key ko access krne kai lie $
      const variable = await cartModel.findOneAndUpdate(
        { _id: cartId, "items.productId": productId },
        { $inc: { "items.$.quantity": Number(-1) } }
      );
      console.log("variable", variable);
      console.log(priceInCart - singleProductPrice);
      let dec = await cartModel.findOneAndUpdate(
        { _id: cartId },
        { totalPrice: priceInCart - singleProductPrice },
        { new: true }
      );
      return res
        .status(200)
        .send({
          status: true,
          message: "product quantity decreased Successfully",
          data: dec,
        });
    }
    if (removeProduct === 0) {
      const removeProduct = await cartModel.findOneAndUpdate(
        { _id: cartId },
        { $pull: { items: { productId: productId } } },
        { new: true }
      );
      console.log(findItems.length);
      await cartModel.findOneAndUpdate(
        { _id: cartId },
        { $inc: { totalItems: Number(-1) } }
      );
      let removePrdt = await cartModel.findOneAndUpdate(
        { _id: cartId },
        { totalPrice: priceInCart - totalPrice },
        { new: true }
      );
      return res
        .status(200)
        .send({
          status: true,
          message: "this product remove successfully",
          data: removePrdt,
        });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { createCart, updateCart };

