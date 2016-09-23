import mongoose, {
	Schema
} from 'mongoose';

const ZoneSchema = new Schema({
	city: String, //城市
	district: String, //行政区域，浦东
	name: String, //小区名字
	x: Number, //百度地图经度
	y: Number, //百度地图纬度
	cid: String, //小区的ID
	monthchange: Number, //环比上月涨幅
	yearchange: Number, //环比去年涨幅
	xqdata: Schema.Types.Mixed,
})

export default mongoose.model('LJ_Zone', ZoneSchema);