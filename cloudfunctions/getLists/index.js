// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'lastdays-d18b8c'
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let dataLists = await db.collection('dateLists').where({
      openid: event.userInfo.openId,
      isDelete: 0
    }).limit(100).get();
    for (let i = 0; i < dataLists.data.length; i++) {
      const parentID = dataLists.data[i].parentID;
      const personsData = await db.collection('jionUsers').where({
        listID: parentID ? parentID : dataLists.data[i]._id
      }).limit(100).get();
      dataLists.data[i].persons = personsData.data;
    }
    return dataLists;
  }catch (e) {
    console.error(e)
  }
}