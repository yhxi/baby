const rhymes = require('../../utils/nurseryRhymes.js')
const app = getApp()

const FAV_KEY = 'nurseryFavs'

Page({
  data: {
    
    appDark: false,categories: rhymes.getCategories(),
    category: '全部',
    keyword: '',
    list: [],
    favs: [],
    showDetail: false,
    current: null
  },

  onShow() {
    
    this.setData({ appDark: getApp().globalData.theme === 'dark' })
const favs = wx.getStorageSync(FAV_KEY) || []
    this.setData({ favs }, () => this.refresh())
  },

  refresh() {
    let list = rhymes.getAll()
    const { category, keyword, favs } = this.data
    if (category !== '全部') list = list.filter(r => r.category === category)
    if (keyword) list = list.filter(r => r.title.indexOf(keyword) >= 0 || r.lyric.indexOf(keyword) >= 0)
    list = list.map(r => Object.assign({}, r, { fav: favs.indexOf(r.id) >= 0 }))
    this.setData({ list })
  },

  onCategoryTap(e) {
    this.setData({ category: e.currentTarget.dataset.c }, () => this.refresh())
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value }, () => this.refresh())
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.id
    const current = rhymes.findById(id)
    this.setData({ showDetail: true, current })
  },

  closeDetail() {
    this.setData({ showDetail: false, current: null })
  },

  onFavTap(e) {
    const id = e.currentTarget.dataset.id
    let favs = wx.getStorageSync(FAV_KEY) || []
    if (favs.indexOf(id) >= 0) {
      favs = favs.filter(x => x !== id)
    } else {
      favs.push(id)
    }
    wx.setStorageSync(FAV_KEY, favs)
    this.setData({ favs }, () => this.refresh())
  },

  noop() {}
})
