// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: 'product-ff8906'
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 1、先查找本人、没有删除、没有过期的数据
    let dataLists = await db.collection('dateLists').where({
      openid: event.userInfo.openId,
      isDelete: 0,
      isLasted: 0
    }).limit(100).get();
    // 2、对以上数据进行判断，若是重复倒数数据，则判断其有没有过期，过期的进行修改和新增操作
    for (let i = 0; i < dataLists.data.length; i++) {
      let item = dataLists.data[i];
      const curDateTime = new Date();
      const curYear = curDateTime.getFullYear();
      const curMon = String(curDateTime.getMonth() + 1).padStart(2, '0');
      const curDay = String(curDateTime.getDate()).padStart(2, '0');
      const dateArr = item.date.split("-");
      const lastDays = parseInt((new Date(`${dateArr[0]}-${dateArr[1].padStart(2, '0')}-${dateArr[2].padStart(2, '0')}`).getTime() - new Date(`${curYear}-${curMon}-${curDay}`).getTime()) / (1000 * 60 * 60 * 24));
      // 判断是否重复倒数
      if (item.isRepeat) {
        // 判断是否需要更新或是新增数据
        let isUpdate = 0;
        if (item.periodIndex == 0) {// 按“年”重复倒数
          // 按年倒数，需要新增数据的
          if (lastDays < 0) {
            // 表示年倒数更新
            isUpdate = 1;
          }
        } else if (item.periodIndex == 1) { // 按“月”重复倒数
          if (lastDays < 0) {
            // 表示月倒数更新
            isUpdate = 2;
          }
        }
        if (isUpdate) {
          // 把到期的数据更新为：到期
          await db.collection('dateLists').where({
            _id: item._id
          })
            .update({
              data: {
                isLasted: 1
              },
            });
          // 同时新增一条此数据
          let yearNew = parseInt(dateArr[0]);
          let monthNew = parseInt(dateArr[1]);
          if (isUpdate == 1) {
            yearNew += 1;
          } else if (isUpdate == 2){
            if (monthNew == 12) {
              monthNew = 1;
              yearNew += 1;
            } else {
              monthNew += 1;
            }
          }
          await db.collection('dateLists').add({
            // data 字段表示需新增的 JSON 数据
            data: {
              openid: event.userInfo.openId,
              title: item.title,
              date: yearNew + '-' + monthNew + '-' + dateArr[2],
              periodIndex: item.periodIndex,
              des: item.des,
              createNickname: item.createNickname,
              createAvatarUrl: item.createAvatarUrl,
              createTime: item.createTime,
              // 即使是初始创建者，也罢parentID设置为最早的id
              parentID: item.parentID ? item.parentID : item._id,
              isDelete: 0,
              isRepeat: item.isRepeat ? item.isRepeat : 0,
              isLasted: 0,
              // 原本为初始创建者的仍是初始创建者
              isStartCreater: item.isStartCreater
            }
          });
        }
      } else {
        if (lastDays < 0) {
          // 把到期的数据更新为：到期
          await db.collection('dateLists').where({
            _id: item._id
          })
            .update({
              data: {
                isLasted: 1
              },
            });
        }
      }
    }
    // 3、修改、新增完数据后，查找所有本人没有删除的数据
    dataLists = await db.collection('dateLists').where({
      openid: event.userInfo.openId,
      isDelete: 0
    }).limit(100).get();
    // 4、根据list数据查找共同分享数据和整理放回数据
    for (let i = 0; i < dataLists.data.length; i++) {
      let item = dataLists.data[i];
      const parentID = item.parentID;
      const personsData = await db.collection('jionUsers').where({
        listID: parentID ? parentID : item._id
      }).limit(100).get();
      item.persons = personsData.data;
      item.isTouchMove = false;
      item.inviteNumber = item.persons.length - 1;
      const curDateTime = new Date();
      const curYear = curDateTime.getFullYear();
      const curMon = String(curDateTime.getMonth() + 1).padStart(2, '0');
      const curDay = String(curDateTime.getDate()).padStart(2, '0');
      const dateArr = item.date.split("-");
      const createTime = new Date(item.createTime);
      const createYear = createTime.getFullYear();
      const createMon = String(createTime.getMonth() + 1).padStart(2, '0');
      const createDay = String(createTime.getDate()).padStart(2, '0');
      // 若是过期数据，则用：倒数日期-创建日期=共倒数的时间
      if (item.isLasted) {
        item.lastDays = parseInt((new Date(`${dateArr[0]}-${dateArr[1].padStart(2, '0')}-${dateArr[2].padStart(2, '0')}`).getTime() - new Date(`${createYear}-${createMon}-${createDay}`).getTime()) / (1000 * 60 * 60 * 24));
      } else { // 没有过期的数据，用：倒数日期-当前日期=还剩倒数天数
        item.lastDays = parseInt((new Date(`${dateArr[0]}-${dateArr[1].padStart(2, '0')}-${dateArr[2].padStart(2, '0')}`).getTime() - new Date(`${curYear}-${curMon}-${curDay}`).getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    return dataLists;
  }catch (e) {
    console.error(e)
  }
}