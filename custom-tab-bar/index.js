Component({
  data: { selected: 0, list: [
    { pagePath: '/pages/index/index', text: '工作台', icon: '⌂' },
    { pagePath: '/pages/timeline/timeline', text: '时光轴', icon: '◷' },
    { pagePath: '/pages/insights/insights', text: '成长册', icon: '✦' },
    { pagePath: '/pages/family/family', text: '我的家', icon: '♡' }
  ] },
  pageLifetimes: { show() { this.updateSelected() } },
  methods: {
    updateSelected() {
      const pages = getCurrentPages(); const page = pages[pages.length - 1]
      const selected = this.data.list.findIndex(item => item.pagePath === '/' + page.route)
      if (selected >= 0) this.setData({ selected })
    },
    switchTab(e) { wx.switchTab({ url: e.currentTarget.dataset.path }) }
  }
})
