/*
[rewrite_local]
#富豪小镇
https://sunnytown.hyskgame.com/api/messages\SaccessToken=\w+&msgtype=system_getGpvGameOptions url script-request-body https://raw.fastgit.org/byxiaopeng/myscripts/main/fhxz.js
[MITM]
hostname = sunnytown.hyskgame.com
#loon
https://sunnytown.hyskgame.com/api/messages\SaccessToken=\w+&msgtype=system_getGpvGameOptions url script-request-body https://raw.fastgit.org/byxiaopeng/myscripts/main/fhxz.js, requires-body=true, timeout=10, tag=柠檬富豪小镇
#surge
富豪小镇 = type=https://sunnytown.hyskgame.com/api/messages\SaccessToken=\w+&msgtype=system_getGpvGameOptions,requires-body=1,max-size=0,script-path=https://raw.fastgit.org/byxiaopeng/myscripts/main/fhxz.js,script-update-interval=0
*/

// [task_local]
//#富豪小镇
// 10 0 * * * https://raw.fastgit.org/byxiaopeng/myscripts/main/fhxz.js, tag=富豪小镇, enabled=true


const $ = new Env('富豪小镇');
let status;
status = (status = ($.getval("fhxzstatus") || "1")) > 1 ? `${status}` : ""; // 账号扩展字符
let fhxzurlArr = []
let fhxzTokenArr = []
let time = Math.round(Date.now() / 1000)
let fhxzurl = $.isNode() ? (process.env.fhxzurl ? process.env.fhxzurl : "") : ($.getdata('fhxzurl') ? $.getdata('fhxzurl') : "")
let fhxzurls = ""
let fhxzToken = $.isNode() ? (process.env.fhxzToken ? process.env.fhxzToken : "") : ($.getdata('fhxzToken') ? $.getdata('fhxzToken') : "")
let fhxzTokens = ""
let skipAcc = 0
let skipCj = 0
let videoCount = 0
let currentToken = ""
let farmlandList = []
let SpeedUpStatus = {}
let remainingAllTimes = 0
//
!(async() => {
  if (typeof $request !== "undefined") {
    fhxzck()
  } else {
    if (!$.isNode()) {  
      fhxzurlArr.push($.getdata('fhxzurl'))
      let fhxzcount = ($.getval('fhxzcount') || '1');
      for (let i = 2; i <= fhxzcount; i++) {
        fhxzurlArr.push($.getdata(`fhxzurl${i}`))
      }
      console.log(`-------------共${fhxzurlArr.length}个账号-------------\n`)
      for (let i = 0; i < fhxzurlArr.length; i++) {
        if (fhxzurlArr[i]) {
          fhxzurl = fhxzurlArr[i];
          $.index = i + 1;
          console.log(`\n开始【富豪小镇账户 ${$.index}】`)
          await getFarmlandList() 
          await qtjsAll(15); //全体加速
          await $.wait(1000);
          await zdcjAll(10);//自动抽奖
          await $.wait(1000);
          await txlb();//提现列表
        }
      }
    } else {
      if (process.env.fhxzToken && process.env.fhxzToken.indexOf('@') > -1) {
        fhxzTokenArr = process.env.fhxzToken.split('@');
        console.log(`您选择的是用"@"隔开\n`)
      } else {
        fhxzTokens = [process.env.fhxzToken]
      };
      Object.keys(fhxzTokens).forEach((item) => {
        if (fhxzTokens[item]) {
          fhxzTokenArr.push(fhxzTokens[item])
        }
      })
      console.log(`共${fhxzTokenArr.length}个账号`)
      for (let k = 0; k < fhxzTokenArr.length; k++) {
        $.message = ""
        userToken = fhxzTokenArr[k]
        $.index = k + 1;
        console.log(`\n开始【富豪小镇账户 ${$.index}】`)
		await initUser()
		await signIn() 
		await $.wait(50);
		await enterGame() 
		await $.wait(1000);
		//await loopFarm()
        await qtjsAll(remainingAllTimes); //全体加速
        await $.wait(1000);
        await zdcjAll(10);//自动抽奖10次
        await $.wait(1000);
		//await getFarmlandList() 
		//await $.wait(1000);
		//await dailyQuest()
		//await $.wait(1000);
        await txlb();//提现列表
      }
    }
  }
})()
  .catch ((e) => $.logErr(e))
  .finally(() => $.done())


//获取cookie
function fhxzck() {
  if ($request.url.indexOf("system_getGpvGameOptions") > -1) {
    const fhxzurl = $request.url
    if (fhxzurl) $.setdata(fhxzurl, `fhxzurl${status}`)
    $.log(fhxzurl)
    $.msg($.name, "", `富豪小镇${status}数据获取成功`)
  }
}

//账户初始化
function initUser(){
	skipAcc = 0
	skipCj = 0
	videoCount = 0
	currentToken = ""
	farmlandList = []
	remainingAllTimes = 15
}

//登录
function signIn(){
  //console.log("accessToken: "+userToken)
  return new Promise((resolve) => {
    let url = {
      url: `https://sunnytown.hyskgame.com/api/messages?accessToken=&msgtype=account_signInAccessToken`,
      body: `[{"type":"account_signInAccessToken","data":{"accessToken":"${userToken}"}}]`,
    }
    $.post(url, async (err, resp, data) => {
      try {
        result = JSON.parse(data);
        //console.log(result)
		currentToken = result[0].data.accessToken
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    }, 0)
  })
}

//进入游戏
function enterGame(){
  return new Promise((resolve) => {
	//console.log("currentToken: "+currentToken)
    let url = {
      url: `https://sunnytown.hyskgame.com/api/messages?accessToken=${currentToken}&msgtype=user_enterGame`,
      body: `[{"type":"user_enterGame","data":{}}]`,
    }
    $.post(url, async (err, resp, data) => {
      try {
        result = JSON.parse(data);
		for (j=0; j < result.length; j++){
			let userItem = result[j]
			//console.log(userItem)
			if(userItem.type == 'user_getUserInfo'){
				console.log(`账户 ${userItem.data.userInfo.nickname} ，现有金币${userItem.data.userInfo.coin}`)
			} else if(userItem.type == 'farmland_getFarmlandList'){
				farmlandList = userItem.data.farmlandList
			} else if(userItem.type == 'farmland_getSpeedUp'){
				remainingAllTimes = userItem.data.speedUpInfo.remainingAllTimes
			}
		}
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    }, 0)
  })
}

//每日任务
function dailyQuest(){
  return new Promise((resolve) => {
    let url = {
      url: `https://sunnytown.hyskgame.com/api/messages?accessToken=${currentToken}&msgtype=dailyQuest_getQuestList`,
      body: `[{"type":"dailyQuest_getQuestList","data":{"questType":1}}]`,
    }
    $.post(url, async (err, resp, data) => {
      try {
        result = JSON.parse(data);
        for (j=0; j < result[0].data.questList.length; j++){
			let userItem = result[0].data.questList
			//console.log(userItem)
			//todo
		}
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    }, 0)
  })
}

//获取田地状态
function getFarmlandList(){
  return new Promise((resolve) => {
    id = fhxzurl.match(/Token=\S+&/)
    let url = {
      url: `https://sunnytown.hyskgame.com/api/messages?accessToken=${currentToken}&msgtype=farmland_getFarmlandList`,
      body: `[{"type":"farmland_getFarmlandList","data":{}}]`,
    }
    $.post(url, async (err, resp, data) => {
      try {
        result = JSON.parse(data);
        farmlandList = result[0].data.farmlandList
        await loopFarm()
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    }, 0)

  })
}
//遍历田地
async function loopFarm(){
	var nt = farmlandList
	for (let i = 0; i < nt.length; i++) {
		if (nt[i]) {
			//console.log("土地："+nt[i].name+"，状态代码 "+nt[i].stateCode)
			switch(nt[i].stateCode){
				//待开凿
				case 1:{
					console.log(`  开凿田地：`+nt[i].name)
					await farmland(i,"unlock")
					await $.wait(2000);
					console.log(`  制作商品：`+nt[i].name)
					await farmland(i,"plant")
					await $.wait(1000);
					break;
				}
				//待制作
				case 2:{
					console.log(`  制作商品：`+nt[i].name)
					await farmland(i,"plant")
					await $.wait(1000);
					break;
				}
				//待维修
				case 5:{
					console.log(`  维修田地：`+nt[i].name)
					await farmland(i,"repair")
					await $.wait(Math.floor(Math.random() * 3000) + 31000);
					break;
				}
				//待收货
				case 6:{
					console.log(`  收获商品：`+nt[i].name)
					await farmland(i,"harvest")
					await $.wait(1000);
					console.log(`  制作商品：`+nt[i].name)
					await farmland(i,"plant")
					await $.wait(1000);
					break;
				}
				
				case 0: //未解锁
				case 3: //生产中
				default:
				break;
			}
		}
	}
}
//操作田地
function farmland(i,move){
  return new Promise((resolve) => {
    id = fhxzurl.match(/Token=\S+&/)
    let num = i+1;
	let priceType =""
	if(move == "plant"){
		priceType = `"priceType" : 2001, `
	}
    let url = {
      url: `https://sunnytown.hyskgame.com/api/messages?access${currentToken}&msgtype=farmland_${move}`,
      body: `[{"type" : "farmland_${move}", "data" : { ${priceType}"farmlandDefId" : ${num}}}]`,
    }
    $.post(url, async (err, resp, data) => {
      try {
        result = JSON.parse(data);
        var lb = result[0]
        //console.log(lb)
        if(lb.data.code){
          $.log(`    =>失败！`)
        }else{
          $.log(`    =>成功！`)
        }
		await $.wait(1000);
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    }, 0)
  })
}

//全体加速 15次
async function qtjsAll(num) {
  for (i=num;i>0;i--) {
    await quantijs(i);
	if(skipAcc == 1){
		break;
	}
  }
}
function quantijs(num) {
  return new Promise((resolve) => {
    id = fhxzurl.match(/Token=\S+&/)
    let url = {
      url: `https://sunnytown.hyskgame.com/api/messages?accessToken=${currentToken}&msgtype=lottery_draw`,
      body: `[{"type":"farmland_speedUpAll","data":{"farmlandDefId":0}}]`,
    }
    $.post(url, async (err, resp, data) => {
      try {
        result = JSON.parse(data);
        var lb = result
        if (lb[0].type == 'system_error') {
          $.log(`\n全体加速今日次数已用完`)
          await $.wait(1000);
		  skipAcc = 1
        } else {
          $.log(`\n全体加速成功 剩余次数：` + num)
          await $.wait(Math.floor(Math.random() * 100) + 32000);
		  //getFarmlandList()
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    }, 0)
  })
}
//抽奖10次
async function zdcjAll(num) {
  for (i=num;i>0;i--) {
    await zdcj(i);
	if(skipCj == 1){
		break;
	}
  }
}

function zdcj(num) {
  return new Promise((resolve) => {
    id = fhxzurl.match(/Token=\S+&/)
    let url = {
      url: `https://sunnytown.hyskgame.com/api/messages?accessToken=${currentToken}&msgtype=lottery_draw`,
      body: `[{"type":"lottery_draw","data":{"priceType":3001}}]`,
    }
    $.post(url, async (err, resp, data) => {
      try {
        result = JSON.parse(data);
        var lb = result
        if (lb[0].type == 'system_error') {
          $.log(`\n抽奖次数不足`)
          await $.wait(1000);
		  skipCj = 1
        } else {
          $.log(`\n抽奖成功 剩余次数：` + num)
          await $.wait(Math.floor(Math.random() * 100) + 32000);
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    }, 0)
  })
}

//提现列表获取
function txlb(timeout = 0) {
  return new Promise((resolve) => {
    id = fhxzurl.match(/Token=\S+&/)
    let url = {
      url: `https://sunnytown.hyskgame.com/api/messages?accessToken=${currentToken}&msgtype=market_getItemList`,
      body: `[{"type":"market_getItemList","data":{}}]`,
    }
    $.post(url, async (err, resp, data) => {
      try {
        result = JSON.parse(data);
        var lb = result
        if(lb)$.log(`提现列表获取成功!`);
        //提现列表
		//console.log(lb)
		//for(let i = 0;i<lb[0].data.marketItemList.length;i++){
		//	console.log(mItem)
		//}
		
        for(let i = 0;i<lb[0].data.marketItemList.length;i++){
			var mItem = lb[0].data.marketItemList[i]
			//console.log(`【提现ID ${mItem.itemDefId}】代售商品${mItem.title}，可售${mItem.cashAmount}元，数量要求${mItem.targetNumber}，现有${mItem.progress}`)
			var str1 = "观看"
			var str2 = "视频"
			let targetStr = mItem.title
			if(targetStr.indexOf(str1) > -1 && targetStr.indexOf(str2) > -1){
				if(mItem.targetNumber > mItem.progress){
				  let cs = mItem.targetNumber - mItem.progress
				  $.log(`观看视频次数不足,还差次数：`+cs)
				  for(let k = 1;k < cs;k++){
					$.log(`开始观看视频第`+k+`次，共需要`+cs+`次`)
					await box()
					await $.wait(1800);
				  }
				}
				if (mItem.stateCode == 1) {
				  $.log(mItem.title+`---提现id:` + mItem.itemDefId)
				  txid1 = mItem.itemDefId
				  await $.wait(3000);
				  await tx3mao();
				} else {
				  $.log(`任务未刷完请骚等\n或今日已经提现`)
				}
			} else {
				
			}
		}

      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    }, timeout)
  })
}

function box() {
  if(videoCount <= 40){
	  $.log(`第${videoCount}次看视频尝试`)
	  return new Promise((resolve) => {
		id = fhxzurl.match(/Token=\S+&/)
		let url = {
		  url: `https://sunnytown.hyskgame.com/api/messages?accessToken=${currentToken}&msgtype=carBox_receiveCarReward`,
		  body: `[{"type":"carBox_receiveCarReward","data":{}}]`,
		}
		$.post(url, async (err, resp, data) => {
		  videoCount = videoCount + 1
		  try {
			result = JSON.parse(data);
			var lb = result[0]
			//console.log(lb)
			if(lb.data.code){
			  $.log(`观看视频失败！过5秒再次尝试`)
			  //console.log(lb)
			  await $.wait(5000);
			  await box()
			}else{
			  $.log(`观看视频成功！`)
			  await $.wait(Math.floor(Math.random() * 1100) + 32000);
			}
		  } catch (e) {
			$.logErr(e, resp);
		  } finally {
			resolve()
		  }
		}, 0)
	  })
  }
}

//提现
function tx3mao(timeout = 0) {
  return new Promise((resolve) => {
    id = fhxzurl.match(/Token=\S+&/)
    let url = {
      url: `https://sunnytown.hyskgame.com/api/messages?accessToken=${currentToken}&msgtype=market_exchange`,
      body: `[{"type":"market_exchange","data":{"itemDefId":${txid1}}}]`,
    }
    $.post(url, async (err, resp, data) => {

      try {
        result = JSON.parse(data);
        var lb = result
        if (lb[0].type == 'system_error') {
          $.log(`任务未刷完\n或今日已经提现了`)
        } else {
          $.log(`提现成功`)
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve()
      }
    }, timeout)
  })
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}isShadowrocket(){return"undefined"!=typeof $rocket}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){if(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:i,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:i,statusCode:r,headers:o,rawBody:h},s.decode(h,this.encoding))},t=>{const{message:i,response:r}=t;e(i,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){let i=require("iconv-lite");this.initGotEnv(t);const{url:r,...o}=t;this.got[s](r,o).then(t=>{const{statusCode:s,statusCode:r,headers:o,rawBody:h}=t;e(null,{status:s,statusCode:r,headers:o,rawBody:h},i.decode(h,this.encoding))},t=>{const{message:s,response:r}=t;e(s,r,r&&i.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
