// 云函数入口文件
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'product-ff8906'
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 能编辑的数据一定是没有过去的数据
    // 1、先查找所有关联此id的没有过期没有删除的数据
    let dataLists = await db.collection('dateLists').where({
      parentID: event.listID,
      isDelete: 0,
      isLasted: 0
    }).limit(100).get();

    // 2、对以上数据进行判断，若已过期的，则判断判断是否是重复倒数，重复倒数则进行新增
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
          } else if (isUpdate == 2) {
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
              openid: item.openId,
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
      }
    }

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
      isDelete: 0,
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