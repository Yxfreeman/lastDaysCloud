// miniprogram/pages/index/index.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData: null,
    backgroundColorArr: ['rgb(240, 95, 141)', 'rgb(249, 127, 121)', 'rgb(252, 190, 66)', 'rgb(177, 141, 220)', 'rgb(61, 201, 135)', 'rgb(67, 193, 201)', 'rgb(78, 177, 243)', 'rgb(148, 127, 120)', 'rgb(130, 169, 218)']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.startPullDownRefresh();
    this.getLists();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getLists();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 到新增页面
   */
  toAdd: function () {
    wx.navigateTo({
      url: '../add/add'
    });
  },
  
  /**
   * 获取列表数据
   */
  getLists: function () {
    wx.cloud.callFunction({
      name: "getLists",
      data: {}
    }).then((res) => {
      if (res.result.errMsg === "collection.get:ok") {
        wx.stopPullDownRefresh();
        let listsData = [...res.result.data];
        listsData.forEach((item, index) => {
          item.inviteNumber = item.persons.length;
          const curDateTime = new Date();
          const curYear = curDateTime.getFullYear();
          const curMon = curDateTime.getMonth() + 1;
          const curDay = curDateTime.getDate();
          const dateArr = item.date.split("-");
          if (item.periodIndex == 0) {
            let compYear = curYear;
            if ((curMon < dateArr[1]) || (curMon == dateArr[1] && curDay <= dateArr[2])) {
              compYear = curYear;
            } else {
              compYear = curYear + 1;
            }
            item.lastDays = parseInt((new Date(`${compYear}-${dateArr[1]}-${dateArr[2]}`).getTime() - new Date(`${curYear}-${curMon}-${curDay}`).getTime()) / (1000 * 60 * 60 * 24));
          } else if (item.periodIndex == 1) {
            let compMon = curMon;
            if (curDay <= dateArr[2]) {
              compMon = curMon;
            } else {
              compMon = curMon + 1;
            }
            item.lastDays = parseInt((new Date(`${curYear}-${compMon}-${dateArr[2]}`).getTime() - new Date(`${curYear}-${curMon}-${curDay}`).getTime()) / (1000 * 60 * 60 * 24));
          }
        });
        this.setData({
          listData: listsData
        });
      }
    }).catch((err) => {
      wx.showToast({
        icon: "none",
        title: err
      });
    });
  }
})