// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: 'product-ff8906'
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let data = await db.collection('dateLists').doc(event.id).get();
    const parentID = data.data.parentID;
    const personsData = await db.collection('jionUsers').where({
      listID: parentID ? parentID : data.data._id
    }).limit(100).get();
    data.data.persons = personsData.data;
    data.data.curOpenid = event.userInfo.openId;
    return data;
  } catch (e) {
    console.error(e)
  }
}