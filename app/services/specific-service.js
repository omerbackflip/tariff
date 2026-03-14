const moment = require('moment');

exports.getExcelToSave = (data) => {
    try {
        let documents = [];
        data.forEach(item => {
        let document = { 
                ///// binarit Table
                chapter: item.chapter,
                topic: item.topic,
                item: item.item,
                fullId: item.fullId,
                description: item.description,
                unit: item.unit,
                price: item.price,
            };
            documents.push(document);
        });
        return documents;
    } catch (error) {
        console.log(error)
        throw error;
    }
},

exports.bulkWriteService = async (model,query) => {
    try {
        return await model.bulkWrite(query);
    } catch (error) {
        console.log(error)
        throw error;
    }
}