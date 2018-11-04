// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: 'product-ff8906'
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const dayRes = await db.collection('dateLists').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        openid: event.userInfo.openId,
        title: event.title,
        date: event.date,
        periodIndex: event.periodIndex,
        des: event.des,
        createNickname: event.createNickname,
        createAvatarUrl: event.createAvatarUrl,
        createTime: db.serverDate(),
        parentID: event.parentID ? event.parentID : '',
        isDelete: 0,
        // 是否重复倒数，0：不重复倒数，1：重复倒数
        isRepeat: event.isRepeat ? event.isRepeat : 0,
        // 是否过期，0：没有过期，1：过期了
        isLasted: 0,
        // 是否是初始创建者,0：不是，1：是
        isStartCreater: event.parentID ? 0 : 1
      }
    });
    return await db.collection('jionUsers').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        openid: event.userInfo.openId,
        listID: event.parentID ? event.parentID : dayRes._id,
        nickname: event.createNickname,
        avatarUrl: event.createAvatarUrl,
        createTime: db.serverDate()
      }
    })
  } catch (e) {
    console.error(e)
  }
}