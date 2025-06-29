const mongoose = require('mongoose');

// Define the transaction schema
const ItemSchema = new mongoose.Schema({
    registrationDate: { type: Date, default: Date.now , required: true},
    company: { type: mongoose.Schema.Types.ObjectId, required: true  },
    title: { type: String, required: true },
    description: { type: String, required: false },
    /*type:{
      type: Number,
      enum: [1,2],
      //1=sale,2=buy
      required: true
    },*/
    status: {
      type: Number,
      enum: [0, 1, 2],
      //1 active
      //0 disabled
      //2 deleted
      default: 1
    },
      unit_of_measurement : { type: String, required: true, default: 'pcs'},
      price_r: { type: Number, required: true,default: 0 },
      price_w: { type: Number, required: true,default: 0 },
      tax_r: { type: Number, required: true,default: 0 },
      tax_w: { type: Number, required: true,default: 0 },
      discount_r: { type: Number, required: true,default: 0 },
      discount_w: { type: Number, required: true,default: 0 }
});


// Export the transaction schema
module.exports = mongoose.model("Item", ItemSchema)
