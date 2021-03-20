var QQMapWX = require("../../libs/qqmap-wx-jssdk.min");
var qqmapsdk;
Page({
  /**
   * 组件的初始数据
   */
  data: {
    region: [],
    now: ''
  },
  /**
   * 声明周期函数，监听页面加载
   */
  onLoad: function() {
    qqmapsdk = new QQMapWX({
      key: 'T3OBZ-VFZHJ-RIBFE-KEFUS-VD746-ZEBUX'
    })
    let that = this;
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success (res) {
        that.getOnlineDistrict(res.latitude, res.longitude);
        new Promise(resolve => {
          that.getGeo(resolve, [res.longitude, res.latitude].join())
        }).then((data) => {
          const locationId = data.location[0].id
          that.getWeather(locationId);
        })
      }
     })
  },
  changeRegion: function(e){ // 切换城市
    this.setData({
      region: e.detail.value
    })
    new Promise(resolve => {
      this.getGeo(resolve, e.detail.value[1])
    }).then((data) => {
      const locationId = data.location[0].id
      this.getWeather(locationId);
    })
  },
  getWeather: function(location) { // 查询天气信息
    var that = this;
    wx.request({
      url: 'https://devapi.qweather.com/v7/weather/now',
      data: {
        location: location,
        key: 'dce13d0f4d38438b9ff5b673ad6acf84'
      },
      success: function(res) {
        that.setData({
          now: res.data.now
        })
      }
    })
  },
  getGeo: function(resolve, location) { // 查询地理位置数据
    wx.request({
      url: 'https://geoapi.qweather.com/v2/city/lookup',
      data: {
        location:location,
        key: 'dce13d0f4d38438b9ff5b673ad6acf84'
      },
      success: function(res) {
        resolve(res.data)
      }
    })
  },
  getOnlineDistrict: function(latitude, longitude) { // 根据经纬度反推省市区
    var that = this;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: latitude,
        longitude: longitude
      },
      success: function (res) {
        console.log(res)
        const address = res.result.address_component
        that.setData({
          region:[address.province, address.city, address.district.length ? address.district: address.street]
        })
     }
    })
  }
})
