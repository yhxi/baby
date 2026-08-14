const storage = require('../../utils/storage.js')
function time(t) { const d = new Date(t); return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2) }
Page({
  data:{ list:[], show:false, title:'', clock:'08:00' },
  onShow(){ this.refresh() },
  refresh(){ this.setData({list:storage.getAll().filter(r=>r.type==='log'&&r.category==='todo').sort((a,b)=>a.time-b.time).map(r=>Object.assign({},r,{timeText:time(r.time),done:!!r.done}))}) },
  open(){this.setData({show:true,title:'',clock:'08:00'})}, close(){this.setData({show:false})}, input(e){this.setData({title:e.detail.value})}, time(e){this.setData({clock:e.detail.value})},
  save(){if(!this.data.title)return wx.showToast({title:'写下待办内容',icon:'none'});const [h,m]=this.data.clock.split(':');const d=new Date();d.setHours(h,m,0,0);storage.addRecord({type:'log',category:'todo',title:this.data.title,time:d.getTime(),note:'每日照护提醒'});this.close();this.refresh()},
  toggle(e){const r=e.currentTarget.dataset.item;storage.updateRecord(r.id,{done:!r.done});this.refresh()},
  remove(e){storage.removeRecord(e.currentTarget.dataset.id);this.refresh()}
})
