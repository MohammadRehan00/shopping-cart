const cartModel = require("../models/cartModel")
const userModel = require("../models/userModel")
const orderModel = require("../models/OrderModel")
const validator = require('../validation/validator');


const createOrder = async function(req, res) {
        try {
            const userId = req.params.userId
            let tokenId = req.userId

            if (!(validator.isValidObjectId(userId) && validator.isValidObjectId(tokenId))) {
                return res.status(400).send({ status: false, message: "userId or token is not valid" });;
            }

            const user = await userModel.findOne({ _id: userId })
            if (!user) {
                res.status(400).send({ status: false, msg: "User not found" })
            }
            if (!(userId.toString() == tokenId.toString())) {
                return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });
            }

            let requestBody = req.body

            if (!validator.isValidRequestBody(requestBody)) {
                return res.status(400).send({ status: false, message: "Please provide data for successful creation" });
            }

            let { cartId, cancellable, status } = requestBody

            if (!validator.isValid(cartId)) {
                return res.status(400).send({ status: false, message: "Please provide cartId" });
            }

            if (!(validator.isValidObjectId(cartId))) {
                return res.status(400).send({ status: false, message: "cartId is not valid" });;
            }
            if (!validator.validString(status)) {
                if (!validator.validforStatus(status)) {
                    return res.status(400).send({ status: false, message: "Status should be among 'pending', 'cancelled', 'completed' " });
                }
            }

            const cartDetails = await cartModel.findOne({ _id: cartId })
            if (!cartDetails) {
                return res.status(400).send({ status: false, message: `cart not present` });
            }

            const totalItems1 = cartDetails.items.length
            var totalQuantity1 = 0;
            for (let i in cartDetails.items) {

                totalQuantity1 += cartDetails.items[i].quantity
            }

            const orderDetails = {
                userId: userId,
                items: cartDetails.items,
                totalPrice: cartDetails.totalPrice,
                totalItems: totalItems1,
                totalQuantity: totalQuantity1,
                cancellable: cancellable,
                status: status

            }
            const order = await orderModel.create(orderDetails)

            return res.status(201).send({ status: true, msg: "Order Successful created, Here are the details ", data: order })
        } catch (err) {
            return res.status(500).send({ status: false, message: err.message });
        }
    }


     //------------------update order details-----------------------------------------------------
     

const updateOrder = async function(req, res) {
    try {
        const userId = req.params.userId
        let tokenId = req.userId
        let requestBody = req.body
        if (!(validator.isValidObjectId(userId) && validator.isValidObjectId(tokenId))) {
            return res.status(400).send({ status: false, message: "userId or token is not valid" });;
        }
        const userDetail = await userModel.findOne({ _id: userId })
        if (!userDetail) {
            return res.status(400).send({ status: false, message: `userId  is not Valid` });
        }
        if (!(userId.toString() == tokenId.toString())) {
            return res.status(401).send({ status: false, message: `Unauthorized access! ` });
        }
        let { orderId, status } = requestBody

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Please provide data to update order" });
        }
        if (!validator.isValid(orderId)) {
            return res.status(400).send({ status: false, message: "Please provide OrderId " });
        }
        if (!(validator.isValidObjectId(orderId))) {
            return res.status(400).send({ status: false, message: "orderId is not valid" });;
        }
        if (!validator.isValid(status)) {
            return res.status(400).send({ status: false, message: "Please provide status for successful Update order" });
        }
        if (!validator.validforStatus(status)) {
            return res.status(400).send({ status: false, message: "Status should be among 'pending', 'cancelled', 'completed' " });
        }
        const orderDetail = await orderModel.findOne({ _id: orderId, isDeleted: false })
        if (!orderDetail) {
            return res.status(400).send({ status: false, message: "Please provide  Vaild OrderId for update Order Data " });
        }

        if (!(orderDetail.userId == userId)) {
            return res.status(400).send({ status: false, message: "This order does not belong to the User " });

        }
        if (orderDetail.cancellable == !'true') {
            return res.status(400).send({ status: false, message: "This order does not have  permission to Cancel Order " });

        }
        if (orderDetail.status == 'completed') {
            return res.status(400).send({ status: false, message: "This order has been completed so it does not have permission to have update" });
        }
        if (orderDetail.status == 'cancelled') {
            return res.status(400).send({ status: false, message: "This order has been cancelled so it does not have permission to have update" });
        }
        const orderupdate = await orderModel.findOneAndUpdate({ _id: orderId }, { status: status }, { new: true })
        return res.status(200).send({ status: true, message: "Order Updated Successfully ", data: orderupdate });

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
}



module.exports = { createOrder, updateOrder }