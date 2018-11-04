// miniprogram/pages/dayDetail/dayDetail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fromPage: null,
    dayDetail: null,
    backgroundColorArr: ['rgb(240, 95, 141)', 'rgb(249, 127, 121)', 'rgb(252, 190, 66)', 'rgb(177, 141, 220)', 'rgb(61, 201, 135)', 'rgb(67, 193, 201)', 'rgb(78, 177, 243)', 'rgb(130, 169, 218)', 'rgb(148, 127, 120)']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ fromPage: options.from });
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
    //读取缓存登录
    wx.getStorage({
      key: 'dayDetail',
      success: (res) => {
        this.setData({ dayDetail: res.data });
      }
    });
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '倒数日',
      path: '/pages/sharePage/sharePage?dayID=' + this.data.dayDetail._id,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
      }
    } 
  },

  /**
   * 到倒数提醒页面
   */
  toSetDay: function () {
    wx.navigateTo({
      url: '../setDay/setDay'
    });
  },

  /**
   * 编辑按钮
   */
  editTap: function () {
    wx.navigateTo({
      url: '../add/add?from=detail'
    });
  }
})