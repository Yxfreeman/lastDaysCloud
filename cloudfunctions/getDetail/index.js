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
    
    let dataDetail = data.data;
    dataDetail.inviteNumber = dataDetail.persons.length - 1;
    dataDetail.isJoin = dataDetail.persons.some((item) => dataDetail.curOpenid === item.openid);
    const curDateTime = new Date();
    const curYear = curDateTime.getFullYear();
    const curMon = String(curDateTime.getMonth() + 1).padStart(2, '0');
    const curDay = String(curDateTime.getDate()).padStart(2, '0');
    const dateArr = dataDetail.date.split("-");
    const createTime = new Date(dataDetail.createTime);
    const createYear = createTime.getFullYear();
    const createMon = String(createTime.getMonth() + 1).padStart(2, '0');
    const createDay = String(createTime.getDate()).padStart(2, '0');

    const lastDays = parseInt((new Date(`${dateArr[0]}-${dateArr[1].padStart(2, '0')}-${dateArr[2].padStart(2, '0')}`).getTime() - new Date(`${curYear}-${curMon}-${curDay}`).getTime()) / (1000 * 60 * 60 * 24));
    // 表示已经过期
    if (lastDays < 0) {
      dataDetail.isLasted = 1;
      dataDetail.lastDays = parseInt((new Date(`${dateArr[0]}-${dateArr[1].padStart(2, '0')}-${dateArr[2].padStart(2, '0')}`).getTime() - new Date(`${createYear}-${createMon}-${createDay}`).getTime()) / (1000 * 60 * 60 * 24));
    } else {
      dataDetail.isLasted = 0;
      dataDetail.lastDays = lastDays;
    }
    return data;
  } catch (e) {
    console.error(e)
  }
}