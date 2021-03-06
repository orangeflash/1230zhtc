var app = getApp();
var util = require('../../../utils/util.js');
Page({
  data: {
    color: '#34aaff',
    tablist: ['全部', '公司名称', '会员等级', '服务员工'],
    status: 0,
    show_no_data_tip: !1,
    hide: 1,
    qrcode: "",
    pagenum: 1,
    storelist: [],
    mygd: false,
    jzgd: true,
  },
  sfzj(e) {
    wx.navigateTo({
      url: '/zh_tcwq/pages/extra/yy/xmmx?userId=' + e.currentTarget.dataset.item.userId + '&storeId=' + e.currentTarget.dataset.item.storeId,
    })
  },
  gdxx(e) {
    wx.navigateTo({
      url: '/zh_tcwq/pages/extra/yy/gdxx?id=' + e.currentTarget.dataset.item.id
    })
  },
  tabclick: function (e) {
    // console.log(e)
    this.setData({
      status: e.currentTarget.dataset.index,
      pagenum: 1,
      storelist: [],
      mygd: false,
      jzgd: true,
    })
    this.reLoad();
  },
  onLoad: function (t) {
    wx.setNavigationBarTitle({
      title: '访客列表',
    })
    app.setNavigationBarColor(this);
    var that = this;
    // app.util.request({
    //   'url': 'entry/wxapp/System',
    //   'cachetime': '0',
    //   success: function (res) {
    //     console.log(res)
    //     that.setData({
    //       System: res.data,
    //     })
    //   }
    // });
    app.util.request({
      'url': 'entry/wxapp/Url',
      'cachetime': '0',
      success: function (res) {
        console.log(res.data)
        that.setData({
          url: res.data,
        })
      },
    })
    //
    var r = this;
    console.log(t)
    r.setData({
      store_id: t.store_id
    })
    this.reLoad();
    // o = !1,
    //   a = !1,
    //   s = 2,
    //   r.loadOrderList(t.status || -1),
    //   getCurrentPages().length < 2 && r.setData({
    //     show_index: !0
    //   })
  },
  yyxminput(e) {
    this.setData({
      [`storelist[${e.currentTarget.dataset.index}].note`]: e.detail.value
    })
    // console.log(e)
  },
  tjxm(e) {
    if (!this.data.storelist[e.currentTarget.dataset.index].note.trim()) return wx.showToast({
      title: '请输入备注',
      icon: 'none',
      duration: 2000
    })
    var a = this,
      oid = this.data.storelist[e.currentTarget.dataset.index].id,
      note = this.data.storelist[e.currentTarget.dataset.index].note;
    console.log(oid)
    wx.showModal({
      title: "提示",
      content: "是否修改备注？",
      cancelText: "否",
      confirmText: "是",
      success: function (s) {
        if (s.cancel) return !0;
        s.confirm && (wx.showLoading({
          title: "操作中"
        }), app.util.request({
          'url': 'entry/wxapp/SaveVisitor',
          data: {
            id: oid,
            note,
          },
          success: function (res) {
            console.log(res.data)
            if (res.data == '1') {
              wx.showToast({
                title: '修改成功',
                icon: 'success',
                duration: 1000,
              })
              setTimeout(function () {
                a.tabclick()
              }, 1000)
            } else {
              wx.showToast({
                title: '请重试',
                icon: 'loading',
                duration: 1000,
              })
            }
          },
        }))
      }
    })
  },
  reLoad: function () {
    var that = this,
      status = this.data.status,
      store_id = this.data.store_id,
      page = this.data.pagenum;
    var qgstate
    if (status == 0) {
      qgstate = '2'
    } else if (status == 1) {
      qgstate = '1'
    } else if (status == 2) {
      qgstate = '3'
    }
    console.log(status, qgstate, store_id, page)
    app.util.request({
      'url': 'entry/wxapp/StoreVisitor',
      'cachetime': '0',
      data: {
        storeId: store_id,
        page: page,
        pagesize: 10,
        sort: status
      },
      success: function (res) {
        // console.log('分页返回的列表数据', res.data)
        for (let i = 0; i < res.data.length; i++) {
          res.data[i].time = util.ormatDate(res.data[i].time)
        }
        if (res.data.length < 10) {
          that.setData({
            mygd: true,
            jzgd: true,
          })
        } else {
          that.setData({
            jzgd: true,
            pagenum: that.data.pagenum + 1,
          })
        }
        var storelist = that.data.storelist;
        storelist = storelist.concat(res.data);

        function unrepeat(arr) {
          var newarr = [];
          for (var i = 0; i < arr.length; i++) {
            if (newarr.indexOf(arr[i]) == -1) {
              newarr.push(arr[i]);
            }
          }
          return newarr;
        }
        storelist = unrepeat(storelist)
        that.setData({
          storelist: storelist
        })
        console.log(storelist)
      }
    });
  },
  onReachBottom: function () {
    console.log('上拉加载', this.data.pagenum)
    var that = this;
    if (!this.data.mygd && this.data.jzgd) {
      this.setData({
        jzgd: false
      })
      this.reLoad();
    } else {}
    // var r = this;
    // a || o || (a = !0, e.request({
    //   url: t.order.list,
    //   data: {
    //     status: r.data.status,
    //     page: s
    //   },
    //   success: function (t) {
    //     if (0 == t.code) {
    //       var e = r.data.order_list.concat(t.data.list);
    //       r.setData({
    //         order_list: e
    //       }),
    //         0 == t.data.list.length && (o = !0)
    //     }
    //     s++
    //   },
    //   complete: function () {
    //     a = !1
    //   }
    // }))
  },
  sjxj: function (e) {
    var a = this,
      oid = e.currentTarget.dataset.id,
      state = e.currentTarget.dataset.state;
    console.log(oid, state)
    wx.showModal({
      title: "提示",
      content: "是否执行上架下架操作？",
      cancelText: "否",
      confirmText: "是",
      success: function (s) {
        if (s.cancel) return !0;
        s.confirm && (wx.showLoading({
          title: "操作中"
        }), app.util.request({
          'url': 'entry/wxapp/AddQgGood',
          'cachetime': '0',
          data: {
            id: oid,
            state: state == '1' ? 2 : 1
          },
          success: function (res) {
            console.log(res.data)
            if (res.data == '1') {
              wx.showToast({
                title: '操作成功',
                icon: 'success',
                duration: 1000,
              })
              setTimeout(function () {
                wx.redirectTo({
                  url: 'wqpsp?store_id=' + a.data.store_id,
                })
              }, 1000)
            } else {
              wx.showToast({
                title: '请重试',
                icon: 'loading',
                duration: 1000,
              })
            }
          },
        }))
      }
    })
  },
  bjsp: function (e) {
    wx.navigateTo({
      url: 'bjqgsp?spid=' + e.currentTarget.dataset.id,
    })
  },
  hide: function (t) {
    this.setData({
      hide: 1
    })
  },
  hxqh: function (e) {
    var a = this,
      oid = e.currentTarget.dataset.id,
      sjid = e.currentTarget.dataset.sjid;
    console.log(oid, sjid)
    wx.showLoading({
      title: "加载中",
      mask: !0
    }), app.util.request({
      'url': 'entry/wxapp/QgOrderCode',
      'cachetime': '0',
      data: {
        order_id: oid
      },
      success: function (res) {
        console.log(res.data)
        a.setData({
          hx_code: res.data,
          hide: 2
        })
      },
    })
  },
});