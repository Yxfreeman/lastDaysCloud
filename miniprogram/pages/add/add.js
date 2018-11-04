// miniprogram/pages/add/add.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listID: null,
    // 主题
    title: "",
    // 日期
    date: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
    // 倒数周期value
    periodIndex: 0,
    // 倒数周期选择
    periodArr: ["年", "月"],
    // 说明
    des: "",
    fromPage: "",
    // 默认重复倒数
    isRepeat: 1,
    // 是否是初始创建者
    isStartCreater: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({fromPage: options.from});
    if (options.from == "detail") {
      //读取缓存登录
      wx.getStorage({
        key: 'dayDetail',
        success: (res) => {
          const dayDetail = res.data;
          this.setData({
            listID: dayDetail._id,
            title: dayDetail.title,
            date: dayDetail.date,
            periodIndex: dayDetail.periodIndex,
            des: dayDetail.des,
            isRepeat: dayDetail.isRepeat,
            isStartCreater: dayDetail.isStartCreater,
            parentID: dayDetail.parentID
          });
        }
      });
    }
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
    clearTimeout(this.timer);
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
   * 主题
   */
  bindTitle: function (e) {
    this.setData({
      title: e.detail.value
    });
  },

  /**
   * 日期改变事件
   */
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    });
  },

  /**
   * 重复倒数
   */
  switchChange: function (e) {
    this.setData({
      isRepeat: e.detail.value ? 1 : 0
    });
  },

  /**
   * 倒数日周期
   */
  bindLastPeriodChange: function (e) {
    if (this.data.isRepeat) {
      this.setData({
        periodIndex: e.detail.value
      });
    }
  },

  /**
   * 备注说明
   */
  bindDes: function (e) {
    this.setData({
      des: e.detail.value
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
   * 保存数据
   */
  saveDays: function () {
    if (!this.data.title) {
      wx.showToast({
        icon: "none",
        title: "倒数日主题不能为空",
      });
      return;
    }
    const personInfo = app.globalData.personInfo;
    const that = this;
    wx.showLoading({mask: true});
    if (this.data.listID == null) {
      wx.cloud.callFunction({
        name: "add",
        data: {
          title: this.data.title,
          date: this.data.date,
          isRepeat: this.data.isRepeat,
          periodIndex: this.data.periodIndex,
          des: this.data.des,
          createNickname: personInfo.nickName,
          createAvatarUrl: personInfo.avatarUrl
        }
      }).then((res) => {
        if (res.result.errMsg === "collection.add:ok") {
          wx.hideLoading();
          wx.showToast({
            icon: "success",
            title: "保存成功",
            success: () => {
              if (this.data.fromPage === "share") {
                // 1秒后返回
                that.timer = setTimeout(() => {
                  wx.reLaunch({
                    url: "../index/index"
                  });
                }, 1000);
              } else {
                // 1秒后返回
                wx.setStorage({
                  key: 'back',
                  data: 'addPage'
                });
                that.timer = setTimeout(() => {
                  wx.navigateBack({
                    delta: 1
                  });
                }, 1000);
              }
            }
          });
        }
      }).catch((err) => {
        console.log(err)
        wx.showToast({
          icon: "none",
          title: "错误"
        });
      });
    } else {
      wx.cloud.callFunction({
        name: "update",
        data: {
          listID: this.data.parentID ? this.data.parentID:this.data.listID,
          des: this.data.des,
        }
      }).then((res) => {
        if (res.result.errMsg === "collection.update:ok") {
          wx.hideLoading();
          wx.showToast({
            icon: "success",
            title: "修改成功",
            success: () => {
              //读取缓存登录，然后重新缓存
              wx.getStorage({
                key: 'dayDetail',
                success: (res) => {
                  const dayDetail = res.data;
                  dayDetail.des = this.data.des;
                  wx.setStorage({
                    key: 'dayDetail',
                    data: dayDetail
                  });
                  wx.setStorage({
                    key: 'back',
                    data: 'addPage'
                  });
                }
              });
              that.timer = setTimeout(() => {
                wx.navigateBack({
                  delta: 1
                });
              }, 1000);
            }
          });
        }
      }).catch((err) => {
        console.log(err)
        wx.showToast({
          icon: "none",
          title: "错误"
        });
      });
    }
  }
})