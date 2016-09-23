import LJ_Zone from '../schemas/ZoneSchema';

exports.getVisibleZones = function *() {
	const swX = this.query.swx;
	const swY = this.query.swy;
	const neX = this.query.nex;
	const neY = this.query.ney;

	const zones = yield LJ_Zone.find({
		x : { $gt : swX, $lt : neX },
		y : { $gt : swY, $lt : neY }
	}).select("name x y xqdata");

    this.body = {
    	state : 0,
    	zones : zones
    };
}

exports.searchZones = function *(){
	const zoneName = this.query.zone_name;
	const reg = new RegExp("^.*" +zoneName+ ".*$");
	const zones = yield LJ_Zone.find({
		name : reg
	}) 

	this.body = {
		zones : zones
	};
}