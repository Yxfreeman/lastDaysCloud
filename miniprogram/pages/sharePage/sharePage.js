// miniprogram/pages/sharePage/sharePage.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listID: "",
    dataDetail: null,
    personInfo: app.globalData.personInfo
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // options.dayID
    this.setData({ listID: options.dayID});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 到新增页面
   */
  toAdd: function () {
    wx.navigateTo({
      url: '../add/add?from=share'
    });
  },

  /**
   * 获取页面数据
   */
  getData: function () {
    wx.cloud.callFunction({
      name: "getDetail",
      data: { id: this.data.listID}
    }).then((res) => {
      if (res.result.errMsg === "document.get:ok") {
        let dataDetail = {...res.result.data};
        dataDetail.inviteNumber = dataDetail.persons.length - 1;
        dataDetail.isJoin = dataDetail.persons.some((item) => dataDetail.curOpenid === item.openid);
        const curDateTime = new Date();
        const curYear = curDateTime.getFullYear();
        const curMon = curDateTime.getMonth() + 1;
        const curDay = curDateTime.getDate();
        const dateArr = dataDetail.date.split("-");
        if (dataDetail.periodIndex == 0) {
          let compYear = curYear;
          if ((curMon < dateArr[1]) || (curMon == dateArr[1] && curDay <= dateArr[2])) {
            compYear = curYear;
          } else {
            compYear = curYear + 1;
          }
          dataDetail.lastDays = parseInt((new Date(`${compYear}-${dateArr[1]}-${dateArr[2]}`).getTime() - new Date(`${curYear}-${curMon}-${curDay}`).getTime()) / (1000 * 60 * 60 * 24));
        } else if (dataDetail.periodIndex == 1) {
          let compMon = curMon;
          if (curDay <= dateArr[2]) {
            compMon = curMon;
          } else {
            compMon = curMon + 1;
          }
          dataDetail.lastDays = parseInt((new Date(`${curYear}-${compMon}-${dateArr[2]}`).getTime() - new Date(`${curYear}-${curMon}-${curDay}`).getTime()) / (1000 * 60 * 60 * 24));
        }
        this.setData({ dataDetail: dataDetail});
      }
    }).catch((err) => {
      wx.showToast({
        icon: "none",
        title: "错误"
      });
    });
  },

  /**
   * 加入倒数
   */
  saveDays: function () {
    const personInfo = app.globalData.personInfo;
    const dataDetail = this.data.dataDetail;
    const that = this;
    wx.showLoading({ mask: true });
    wx.cloud.callFunction({
      name: "add",
      data: {
        title: dataDetail.title,
        date: dataDetail.date,
        periodIndex: dataDetail.periodIndex,
        des: dataDetail.des,
        createNickname: personInfo.nickName,
        createAvatarUrl: personInfo.avatarUrl,
        parentID: this.data.listID
      }
    }).then((res) => {
      if (res.result.errMsg === "collection.add:ok") {
        wx.hideLoading();
        wx.showToast({
          icon: "success",
          title: "保存成功",
          success: () => {
            // 1秒后返回
            that.timer = setTimeout(() => {
              wx.reLaunch({
                url: "../index/index"
              });
            }, 1000);
          }
        });
      }
    }).catch((err) => {
      wx.showToast({
        icon: "none",
        title: "错误"
      });
    });
  },

  /**
   * 获取用户信息
   */
  onGotUserInfo: function (res) {
    app.globalData.personInfo = res.detail.userInfo;
    this.saveDays();
  },

  /**
   * 回到主页
   */
  toHome: function () {
    wx.reLaunch({
      url: "../index/index"
    });
  }
})