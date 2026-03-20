const moment = require('moment');

exports.getExcelToSave = (data) => {
    try {
        let documents = [];
        data.forEach(item => {
        let document = { 
                ///// binarit and dekel are similar tables 
                chapter: item.chapter,
                topic: item.topic,
                item: item.item,
                fullId: item.fullId,
                description: item.description,
                unit: item.unit,
                price: item.price,

                ///// table table
                // table_id: 9,
                // table_code: item.table_code,
                // description: item.description,
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