const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({

    userId: {
        type: ObjectId,
        ref : 'User_details',
        required: true
    },
    items: [{
      productId: {
          type:ObjectId , 
          ref: 'Product_details',
          required: true
        },
      quantity: {
          type: Number, 
          required: true,
          min: 1
        }
    }],
    totalPrice: {
        type: Number, 
        required: true, 
        comment: "Holds total price of all the items in the cart"
    },
    totalItems: {
        type: Number, 
        required: true, 
        comment: "Holds total number of items in the cart"
    },
    totalQuantity: {
        type: Number,
         required: true,
          comment: "Holds total number of items in the cart"},
    cancellable: {
        type: Boolean,
         default: true
        },
    status: {
        type: String,
         default: 'pending',
          enum: ["pending", "completed", "cancelled"]
        }

}, { timestamps: true })

module.exports = mongoose.model('Order_details', orderSchema)