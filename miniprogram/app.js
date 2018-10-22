//app.js
App({
  getInfo: function () {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.personInfo = res.userInfo
            }
          });
        } else {
          wx.authorize({
            scope: 'scope.userInfo',
            success() {
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  console.log(res)
                  this.globalData.personInfo = res.userInfo;
                }
              });
            }
          })
        }
      }
    })
    // wx.cloud.callFunction({
    //   name: 'login',
    //   data: {}
    // }).then((res) => {
    //   this.globalData.openid = res.result.openid;
      
    // }).catch((err) => {
    //   wx.showToast({
    //     icon: 'none',
    //     title: '获取 openid 失败，请检查是否有部署 login 云函数',
    //   })
    //   console.log('[云函数] [login] 获取 openid 失败，请检查是否有部署云函数，错误信息：', err)
    // })
  },
  getNavHeight: function () {
    // 获取手机系统信息
    wx.getSystemInfo({
      success: res => {
        //导航高度
        this.globalData.navHeight = res.statusBarHeight + 46;
      }, fail(err) {
        console.log(err);
      }
    });
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'product-ff8906',
        traceUser: true,
      });
      this.getInfo();
      // this.getNavHeight();
    }

    this.globalData = {}
  }
})
