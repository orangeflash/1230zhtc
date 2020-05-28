// zh_hyk/pages/index/md.js
var app = getApp()
var QQMapWX = require('../../../utils/qqmap-wx-jssdk.js');
var util = require('../../utils/util.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listarr: ['代金券', '折扣券'],
    activeIndex: 0,
    focus: true,
    disabled: false,
    qlq: true,
    djq: [],
    zkq: [],
    discounttext: '0',
    checkboxChange: [],
    radioChange: '',
    isyhq: false,
    yhqnum: 0,
    kdje: 0,
    yhqname: '',
    total: 0,
    showModal: false,
    zffs: 1,
    zfz: false,
    zfwz: '微信支付',
    btntype: 'btn_ok1',
    marqueePace: 1,
    marqueeDistance: 0,
    size: 14,
    interval: 20,
    radioItems: [],
    countryIndex: 0,
    zfmode: 0,
    jfzkje: 0,
    hyzkje: 0,
  },
  getTotal() {
    let v = this.data, zfmode = v.zfmode, srmoney = v.srmoney || 0, xzmoney = v.countries[v.countryIndex]&&v.countries[v.countryIndex].money||0, xcyf = util.calculateDiffTime(new Date(v.timestart).getTime(), new Date(v.timeend).getTime()), month = 0, jfbl = (v.mdinfo.integral_max || 0) / 100, hyzk = v.userInfo.vipInfo.discount || 10, jfzkje = 0, hyzkje = 0, total = 0, yhjf = v.userInfo.total_score
    if (zfmode == 1) {
      let money = 0
      if (xcyf[0]) {
        month = xcyf[0] * 12 + xcyf[1]
      } else {
        month = xcyf[1]
      }
      money = xzmoney * month
      hyzkje = +(money * (10 - hyzk) / 10).toFixed(2)
      // console.log(m,money)
      if (yhjf - (money - hyzkje) * jfbl >= 0) {
        jfzkje = Math.ceil((money - hyzkje) * jfbl)
      } else {
        jfzkje = +yhjf
      }
      total = money - jfzkje - hyzkje
    } else {
      hyzkje = +(srmoney * (10 - hyzk) / 10).toFixed(2)
      // console.log(m,money)
      if (yhjf - (srmoney - hyzkje) * jfbl >= 0) {
        jfzkje = Math.ceil((srmoney - hyzkje) * jfbl)
      } else {
        jfzkje = +yhjf
      }
      total = srmoney - jfzkje - hyzkje
    }
    this.setData({
      jfzkje,
      hyzkje,
      total:+total.toFixed(2),
      month,
    })
    console.log(zfmode, srmoney, xzmoney, xcyf, jfbl, hyzk, yhjf)
  },
  bindTypeChange: function (e) {
    this.setData({
      countryIndex: e.detail.value,
    })
    this.getTotal()
  },
  bindTimeChange: function (e) {
    this.setData({
      timestart: e.detail.value
    })
    this.getTotal()
    console.log(e.detail.value)
  },
  bindTimeChange1: function (e) {
    this.setData({
      timeend: e.detail.value
    })
    this.getTotal()
    console.log(e.detail.value)
  },
  zfradioChange: function (e) {
    var radioItems = this.data.radioItems;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      radioItems[i].checked = radioItems[i].value == e.detail.value;
    }

    this.setData({
      radioItems: radioItems,
      zfmode: e.detail.value,
    });
    this.getTotal()
  },
  scrolltxt: function () {
    var that = this;
    var length = that.data.length;
    var windowWidth = that.data.windowWidth;
    var interval = setInterval(function () {
      var maxscrollwidth = length + windowWidth;
      var crentleft = that.data.marqueeDistance;
      if (crentleft < maxscrollwidth) {
        that.setData({
          marqueeDistance: crentleft + that.data.marqueePace
        })
      } else {
        that.setData({
          marqueeDistance: 0
        });
        clearInterval(interval);
        that.scrolltxt();
      }
    }, that.data.interval);
  },
  qrmd: function (e) {
    var xfje = Number(this.data.total),
      uid = wx.getStorageSync('users').id,
      sjid = this.data.mdinfo.id,
      openid = wx.getStorageSync("openid"),
      form_id = e.detail.formId,
      v = this.data,
      zfmode = v.zfmode, xzitem = v.countries[v.countryIndex], endTime = v.timeend, startTime = v.timestart
    console.log(xfje, uid, sjid, openid, form_id, zfmode, xzitem, endTime, startTime)
    app.util.request({
      'url': 'entry/wxapp/SaveFormid',
      'cachetime': '0',
      data: {
        user_id: uid,
        form_id: form_id,
        openid: openid,
      },
      success: function (res) {

      },
    })
    if (xfje <= 0) {
      wx.showModal({
        title: '提示',
        content: '消费金额不能小于0哦~',
      })
      return false
    }
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    // AddDmOrder
    app.util.request({
      'url': 'entry/wxapp/AddDmOrder',
      'cachetime': '0',
      data: {
        user_id: uid,
        money: v.srmoney,
        store_id: sjid,
        type: zfmode == 1 ? 2 : 1,
        typeId: xzitem&&xzitem.id||'',
        endTime,
        startTime,
      },
      success: function (res) {
        console.log(res)
        var orderid = res.data;
        app.util.request({
          'url': 'entry/wxapp/pay4',
          'cachetime': '0',
          data: {
            openid: openid,
            money: xfje,
            order_id: orderid
          },
          success: function (res) {
            console.log(res)
            // 支付
            wx.requestPayment({
              'timeStamp': res.data.timeStamp,
              'nonceStr': res.data.nonceStr,
              'package': res.data.package,
              'signType': res.data.signType,
              'paySign': res.data.paySign,
              'success': function (res) {
                console.log(res)
              },
              'complete': function (res) {
                console.log(res)
                if (res.errMsg == 'requestPayment:fail cancel') {
                  wx.showToast({
                    title: '取消支付',
                  })
                }
                if (res.errMsg == 'requestPayment:ok') {
                  wx.showModal({
                    title: '提示',
                    content: '支付成功',
                    showCancel: false,
                  })
                  setTimeout(function () {
                    wx.navigateBack({})
                  }, 1000)
                }
              }
            })
          },
        })
      }
    })
    // this.setData({
    //   showModal: true,
    // })
  },
  radioChange1: function (e) {
    console.log('radio1发生change事件，携带value值为：', e.detail.value)
    if (e.detail.value == 'wxzf') {
      this.setData({
        zffs: 1,
        zfwz: '微信支付',
        btntype: 'btn_ok1',
      })
    }
    if (e.detail.value == 'yezf') {
      this.setData({
        zffs: 2,
        zfwz: '余额支付',
        btntype: 'btn_ok2',
      })
    }
    if (e.detail.value == 'jfzf') {
      this.setData({
        zffs: 3,
        zfwz: '积分支付',
        btntype: 'btn_ok3',
      })
    }
  },
  yczz: function () {
    this.setData({
      showModal: false,
    })
  },
  qlq: function () {
    console.log(this.data)
    if (this.data.xfje == 0) {
      wx.showToast({
        title: '请输入消费金额',
        icon: 'loading',
        duration: 1000,
      })
      return
    }
    this.setData({
      qlq: false,
    })
  },
  qdzz: function () {
    this.setData({
      qlq: true
    })
  },
  hqjd: function (e) {
    this.setData({
      focus: true,
    })
  },
  sqjd: function (e) {
    console.log(e.detail.value)
    this.setData({
      focus: false,
      xfje: Number(e.detail.value),
    })
  },
  jstotal: function () {
    console.log(this.data)
    var total = (Number(this.data.xfje) - Number(this.data.discounttext)).toFixed(2);
    if (this.data.checkboxChange.indexOf('quan') !== -1) {
      total = (total - Number(this.data.kdje)).toFixed(2)
      console.log('选择了优惠券')
      this.setData({
        isyhq: true,
      })
    } else {
      console.log('没有选择券')
      this.setData({
        isyhq: false,
      })
    }
    if (total <= 0) {
      total = 0;
    }
    this.setData({
      total: total,
    })
  },
  checkboxChange: function (e) {
    this.setData({
      checkboxChange: e.detail.value,
    })
    this.jstotal();
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
  },
  radioChange: function (e) {
    this.setData({
      radioChange: e.detail.value,
    })
    console.log('radio发生change事件，携带value值为：', e.detail.value)
  },
  xzq: function (e) {
    console.log(e.currentTarget.dataset, this.data.xfje)
    if (Number(e.currentTarget.dataset.full) > this.data.xfje) {
      wx.showModal({
        title: '提示',
        content: '您的消费金额不满足此优惠券条件',
      })
      return false;
    }
    this.setData({
      activeradio: e.currentTarget.dataset.rdid,
      yhqnum: 1,
      yhqfull: e.currentTarget.dataset.full,
      yhqname: e.currentTarget.dataset.type,
      yhqkdje: e.currentTarget.dataset.kdje,
    })
    if (e.currentTarget.dataset.type == '代金券') {
      this.setData({
        kdje: e.currentTarget.dataset.kdje,
      })
    }
    if (e.currentTarget.dataset.type == '折扣券') {
      this.setData({
        kdje: ((1 - Number(e.currentTarget.dataset.kdje) * 0.1) * Number(this.data.xfje)).toFixed(2),
      })
    }
    this.jstotal();
  },
  bindinput: function (e) {
    this.setData({
      srmoney: e.detail.value
    })
    this.getTotal()
  },
  //点击切换排序
  tabClick: function (e) {
    var that = this;
    var index = e.currentTarget.id
    console.log(index)
    this.setData({
      activeIndex: e.currentTarget.id,
    });
  },

  yuan: function () {
    console.log('yuan')
    var that = this;
    wx.showModal({
      title: '会员等级说明',
      content: that.data.userInfo.details,
      showCancel: false,
    })
  },
  ji: function () {
    console.log('ji')
    wx.showModal({
      title: '积分规则',
      content: '1积分可抵一元，最高可抵订单金额50%',
      showCancel: false,
    })
  },
  lqyhq: function (uid, sjid) {
    var that = this;
    //Coupons
    app.util.request({
      'url': 'entry/wxapp/MyCoupons2',
      'cachetime': '0',
      data: {
        user_id: uid,
        store_id: sjid
      },
      success: function (res) {
        console.log('优惠券信息', res.data)
        var received = res.data;
        var djq = [],
          zkq = [];
        for (let i = 0; i < received.length; i++) {
          if (received[i].type == '1' && received[i].state == '2') {
            djq.push(received[i]);
          }
          if (received[i].type == '2' && received[i].state == '2') {
            zkq.push(received[i]);
          }
        }
        console.log(djq, zkq)
        that.setData({
          djq: djq,
          zkq: zkq,
        })
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options, this.data)
    var that = this;
    var url = wx.getStorageSync('url');
    var mdid = options.sjid
    console.log(mdid)
    var uid = wx.getStorageSync('users').id;
    console.log(uid)
    that.lqyhq(uid, mdid)
    var start = util.formatTime(new Date).substring(0, 7).replace(/\//g, "-");
    this.setData({
      start: start,
      timestart: start,
      timeend: start,
    });
    //UserInfo
    app.util.request({
      'url': 'entry/wxapp/UserInfo',
      'cachetime': '0',
      data: {
        user_id: uid
      },
      success: function (res) {
        console.log('用户信息', res.data)
        if (res.data.discount != null) {
          var discount = res.data.discount
        } else {
          var discount = 100
        }
        that.setData({
          userInfo: res.data,
          discount: discount,
          integral: res.data.integral,
        })
        if (res.data.grade == '0') {
          wx.showModal({
            title: '提示',
            content: '开卡成为会员能享受优惠买单哦~',
          })
          setTimeout(function () {
            wx.redirectTo({
              url: '../my/login',
            })
          }, 1500)
        }
      }
    });
    //Store 
    app.util.request({
      'url': 'entry/wxapp/StoreInfo',
      'cachetime': '0',
      data: {
        id: mdid
      },
      success: function (res) {
        // console.log('门店信息', res.data)
        // that.lqyhq(uid, res.data.id)
        that.setData({
          mdinfo: res.data.store[0],
        })
        wx.setNavigationBarTitle({
          title: '欢迎光临' + res.data.store[0].store_name,
        })
        var length = res.data.store[0].details.length * that.data.size,
          arr = [];

        var windowWidth = wx.getSystemInfoSync().windowWidth;
        // console.log(length, windowWidth);
        if (res.data.store[0].is_month == 1) {
          arr = [{
            name: '不按月收费',
            value: '0',
            checked: true
          },
          {
            name: '按月收费',
            value: '1',
          }
          ]
        }
        that.setData({
          length: length,
          windowWidth: windowWidth,
          radioItems: arr,
        })
        that.scrolltxt();
      }
    });
    app.util.request({
      'url': 'entry/wxapp/system',
      'cachetime': '0',
      success: function (res) {
        console.log(res)
        that.setData({
          xtxx: res.data,
          url: url,
          jf_proportion: res.data.jf_proportion,
        })
        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: res.data.color,
        })
        if (res.data.is_yue == '1') {
          that.setData({
            kqyue: true
          })
        } else {
          that.setData({
            kqyue: false
          })
        }
        if (res.data.is_jf == '1' && res.data.is_jfpay == '1') {
          that.setData({
            kqjf: true
          })
        } else {
          that.setData({
            kqjf: false
          })
        }
      },
    })
    app.util.request({
      'url': 'entry/wxapp/DmService',
      data: {
        storeId: mdid
      },
      success: (res) => {
        this.setData({
          countries: res.data,
        })
      }
    });
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // wx.showToast({
    //   title: '上拉触底',
    // })
  }
})