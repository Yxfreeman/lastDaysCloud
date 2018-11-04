// 云函数入口文件
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: 'product-ff8906'
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    await db.collection('dateLists').where({
      _id: event.listID,
      isLasted: 0
    })
      .update({
        data: {
          des: event.des
        },
      });
    return await db.collection('dateLists').where({
      parentID: event.listID,
      isLasted: 0
    })
      .update({
        data: {
          des: event.des
        },
      });
  } catch (e) {
    console.error(e)
  }
}