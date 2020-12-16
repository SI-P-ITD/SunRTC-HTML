/**
 * Copyright © 2020 SIG.Co.Ltd. All rights reserved.
 * 
 * @author: Bruce
 * 
 * */
var webSocketUrl = "";
var ws;
var canRefresh = false;
var isTakephoto = true; 
var farEndName;
var businessNo;
var orderId;
var netWorkType;
var phoneModel;
var camera;
var record;
var roomNo;
var tim ;
var connect = function(userName,sdkDatas) {
	console.log(userName)
	var options = {
		SDKAppID: sdkDatas.sdkAppId
	}
	tim = TIM.create(options);
	tim.setLogLevel(0); 
	tim.registerPlugin({'cos-js-sdk': COS});
	initIM()
	tim.login({
		userID: userName + '-PC',
		userSig: sdkDatas.userSig
	})
}

function initIM(){
		tim.on(TIM.EVENT.SDK_READY, function(event) {
			console.log('SDK_READY',event)
		  // 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
		  // event.name - TIM.EVENT.SDK_READY
		});
		
		tim.on(TIM.EVENT.MESSAGE_RECEIVED, function(event) {
			console.log("接收消息", event.data[0])
			console.log(event.data[0].payload.data)
			var msgObj = JSON.parse(event.data[0].payload.text)
			console.log(msgObj)
			if(msgObj.callStatus=="3000") {
				window.location.reload();
				// 结束通话
			}else if(msgObj.callStatus=="2010"){
				$("#loading").hide();
				vm.enterRoom(1)
				//对方接受视频
			}else if(msgObj.callStatus=="2000"){
				var reqUserName = msgObj.reqUserName;
				sessionStorage.setItem("respUserName", msgObj.respUserName);
				sessionStorage.setItem("reqUserName", reqUserName);
				sessionStorage.setItem("orderId",msgObj.orderId);
				sessionStorage.setItem("deviceType", msgObj.deviceType);
				sessionStorage.setItem("roomNo", msgObj.roomNo);
				vm.roomNo = msgObj.roomNo
				$('#linkModel').show();
				vm.videoStart();
				//接收到视频请求
			}else if(msgObj.callStatus=="2020"){
				//收到图片共享
				vm.imgDataList.push({"image":msgObj.fileUrl});
				//收到IM消息，重新获取图片列表
			}else if(msgObj.callStatus=="2031"){
				$('#linkModel').hide();
			  // 取消呼叫
			}else if(msgObj.callStatus=="2034"){
				$('#linkModel').hide();
			  //无应答
			}else if(msgObj.callStatus=="2030"){
				window.location.reload();
			  //拒绝请求
			}else if(msgObj.callStatus=="1030"){
				
			  //设备信息
			}else if(msgObj.callStatus=="1032"){
				var obj = {
					text:msgObj.data,
					name:msgObj.sender,
					type:'2'
				}
				vm.messageInfo.messageList.push(obj)
			  //文字消息
			}else if(msgObj.callStatus=='2033'){
				$('#linkModel').hide();
			  // 不方便接听
			}else if(msgObj.callStatus=='5000'){
				$('#linkModel').hide();
				// 客户忙线中
			  // 定义发送IM消息
			}else{
			  console.log("收到消息: " + msg);
			}
		  // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
		  // event.name - TIM.EVENT.MESSAGE_RECEIVED
		  // event.data - 存储 Message 对象的数组 - [Message]
		});
		
		tim.on(TIM.EVENT.MESSAGE_REVOKED, function(event) {
			console.log('收到消息被撤回的通知',event)
		  // 收到消息被撤回的通知
		  // event.name - TIM.EVENT.MESSAGE_REVOKED
		  // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isRevoked 属性值为 true
		});
		
		tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, function(event) {
			console.log('收到会话列表更新通知',event)
		  // 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
		  // event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
		  // event.data - 存储 Conversation 对象的数组 - [Conversation]
		});
		
		tim.on(TIM.EVENT.GROUP_LIST_UPDATED, function(event) {
			console.log('收到群组列表更新通知',event)
		  // 收到群组列表更新通知，可通过遍历 event.data 获取群组列表数据并渲染到页面
		  // event.name - TIM.EVENT.GROUP_LIST_UPDATED
		  // event.data - 存储 Group 对象的数组 - [Group]
		});
		
		tim.on(TIM.EVENT.PROFILE_UPDATED, function(event) {
			console.log('收到自己或好友的资料变更通知',event)
		  // 收到自己或好友的资料变更通知
		  // event.name - TIM.EVENT.PROFILE_UPDATED
		  // event.data - 存储 Profile 对象的数组 - [Profile]
		});
		
		tim.on(TIM.EVENT.BLACKLIST_UPDATED, function(event) {
			console.log('收到黑名单列表更新通知',event)
		  // 收到黑名单列表更新通知
		  // event.name - TIM.EVENT.BLACKLIST_UPDATED
		  // event.data - 存储 userID 的数组 - [userID]
		});
		
		tim.on(TIM.EVENT.ERROR, function(event) {
			console.log('收到 SDK 发生错误通知',event)
		  // 收到 SDK 发生错误通知，可以获取错误码和错误信息
		  // event.name - TIM.EVENT.ERROR
		  // event.data.code - 错误码
		  // event.data.message - 错误信息
		});
		
		tim.on(TIM.EVENT.SDK_NOT_READY, function(event) {
			console.log('此时 SDK 无法正常工作',event)
			//连接断开
		  // 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
		  // event.name - TIM.EVENT.SDK_NOT_READY
		});
		
		tim.on(TIM.EVENT.KICKED_OUT, function(event) {
			console.log('收到被踢下线通知',event)
		  // 收到被踢下线通知
		  // event.name - TIM.EVENT.KICKED_OUT
		  // event.data.type - 被踢下线的原因，例如:
		  //    - TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多实例登录被踢
		  //    - TIM.TYPES.KICKED_OUT_MULT_DEVICE 多终端登录被踢
		  //    - TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED 签名过期被踢 （v2.4.0起支持）。 
		});
		
		 tim.on(TIM.EVENT.NET_STATE_CHANGE, function(event) { 
			 console.log('网络状态发生改变',event)
		  //  网络状态发生改变（v2.5.0 起支持）。 
		  // event.name - TIM.EVENT.NET_STATE_CHANGE 
		  // event.data.state 当前网络状态，枚举值及说明如下： 
		  //     \- TIM.TYPES.NET_STATE_CONNECTED - 已接入网络 
		  //     \- TIM.TYPES.NET_STATE_CONNECTING - 连接中。很可能遇到网络抖动，SDK 在重试。接入侧可根据此状态提示“当前网络不稳定”或“连接中” 
		  //    \- TIM.TYPES.NET_STATE_DISCONNECTED - 未接入网络。接入侧可根据此状态提示“当前网络不可用”。SDK 仍会继续重试，若用户网络恢复，SDK 会自动同步消息  
		});
}

function reconnect(username) {
      if(lockReconnect) {
        return;
      };
      lockReconnect = true;
      //没连接上会一直重连，设置延迟避免请求过多
	  connect(username);
}
var heartCheck = {
	 timeout: 30000,
     severTimeout: 5000,  //服务端超时时间
     reset: function(){
     	clearTimeout(this.timeoutObj);
     	clearTimeout(this.serverTimeoutObj);
     	return this;
     },
     start: function(){
     	var self = this;
     	this.serverTimeoutObj = setInterval(function(){
     		if(ws.readyState == 1){
     			console.log("连接状态，发送消息保持连接");
     			ws.send("ping");
     			heartCheck.reset().start();    // 如果获取到消息，说明连接是正常的，重置心跳检测
     		}else{
     			console.log("断开状态，尝试重连");
     			 connect(username);
     		}
     	}, this.timeout)
     }
	
}
/**
 * webSocket链接状态
 */
function setConnected(connected) {
	console.log('%cwebScoket', 'color:#319BF7', connected)
	if(connected) {
		vm.userInfo.online = true;
	} else {
		vm.userInfo.online = false;
		// goToIndex();
	}
}
// 发送登录命令
function socketLoginMsg() {
	var currentTime = getCurrentTime();
	var msg = "101|" + vm.userInfo.userCode + "||" + currentTime + "|login";
	setTimeout(ws.send(msg), 200);
	setConnected(true);
}

// 发送退出命令
function socketLogoutMsg() {
	var currentTime = getCurrentTime();
	var msg = "102|" + vm.userInfo.userCode + "||" + currentTime + "|logout";
	ws.send(msg);
	setTimeout(disconnect(), 200);
}
// socket关闭
function disconnect() {
	if(ws != null) {
		ws.close();
		ws = null;
	}
	setConnected(false);
}
// 视频请求接入
function rtmpUpRequst(msg) {
	var msgs = msg.split("|");
	var msgContext = msgs[4];
	var caseInfo = eval("(" + msgContext + ")");
	
	// add xinpei 状态信息
	 if(caseInfo.linkState=='10' ){
		 vm.findCaseList(); // 更新案件列表
		 log("信赔案件客户已转人工处理，请在十分钟内联系用户");
		 return ;
	 }
		
	// add end	
 
	log("案件请求接入，案件号：" + caseInfo.caseNo);
	vm.caseData.liNowCasePhone = caseInfo.userPhone;
	sessionStorage.setItem("video", JSON.stringify(caseInfo));
	startwaj(); // 播放音乐
	var conMsg =
		"时间：" + timeFormat(new Date(), 'yyyy-MM-dd hh-mm-ss') + "  案件请求接入，案件号：" + caseInfo.caseNo;
	showModal({
		title: "提示",
		content: conMsg,
		success: function(r) {
			if(r) {
				canRefresh = true;
				var ctime = getCurrentTime();
				msg = "312|";
				msg += vm.caseData.liNowCasePhone ? vm.caseData.liNowCasePhone : '';
				msg += "|" + vm.userInfo.userCode + "|" + ctime + "|" + caseInfo.id;
				vm.caseData.linkId = caseInfo.id;
				sendMsgAjax(msg);
				vm.caseData.liNowCaseNo = caseInfo.caseNo;
				vm.caseData.caseNo = caseInfo.caseNo;
				vm.caseData.netStatusId = caseInfo.netWorkType;
				$("#picDivId").html("");
				$("#picShowImgId").attr("src", "homecssimg/backVideo.png");
				vm.findPicture(vm.caseData.liNowCaseNo);
				endmusic(); // 结束音乐
				vm.findCaseList(); // 更新案件列表
				setTimeout(hideLeftListes, 1200);
			} else {
				var ctime = getCurrentTime();
				msg =
					"313|" +
					vm.caseData.liNowCasePhone +
					"|" +
					vm.userInfo.userCode +
					"|" +
					ctime +
					"|" +
					caseInfo.id;
				sendMsgAjax(msg);
				endmusic(); // 结束音乐
				vm.findCaseList(); // 更新案件列表
			}
		}
	});
}

/**
 */
function upRtmpSing(msg,type){
	console.log(msg);
	var msgs = msg.split("|");
	var msgContext = msgs[4];
	var msgInfo = JSON.parse(msgContext);
	var groupType = msgInfo.groupType;
	vm.pageData.groupList = [];
	vm.pageData.groupList.push(msgInfo);
	if(groupType == '01'){
		groupType = '车物'
	}else if(groupType == '02'){
		groupType = '人伤'
	}else if(groupType == '03'){
		groupType = '大案'
	}else{
		groupType = '非车'
	}
	var groupName = msgInfo.groupName
	if(type == 1){
		log(
			'签退申请被拒绝,归属团队:' +
			groupName+'('+ groupType +')' ,'red'
			
		);
	}else if(type == 2){
		log(
			'签退申请超时,归属团队:' +
			groupName+'('+ groupType +')' ,'red'
			
		);
	}else{
		log(
			'签退申请通过,归属团队:' +
			groupName+'('+ groupType +')','blue'
		);
	}
	
}


/**
 * 解析上传照片socket报文
 */
function upRtmpPic(msg) {
	console.log(msg);
	var msgs = msg.split("|");
	var msgContext = msgs[4];
	var msgInfo = JSON.parse(msgContext);
	var caseNo = msgInfo.caseNo;
	onLinePic(msgInfo);
}

function onLinePic(msg) {

	setTimeout(function() {
		let setPageImg = function() {
			if(IsExist(msg.picUrl)) {
				console.log('%cIsExist', 'color:#ff0c8d;', true)
				vm.pageData.getImgList.push(msg);
				vm.viewerImg();
			} else {
				console.log('%cIsExist', 'color:#ff0c8d;', false)
				setTimeout(function() {
					setPageImg()
				}, 1000)
			}
		}
		setPageImg();
		// $('#viewer').viewer('view', vm.pageData.getViewerImgList.length - 1);
	}, 1000)
}
// 视频请求接入 等待
function rtmpUpRequstWaite(msg) {
	var msgs = msg.split("|");
	var msgContext = msgs[4];
	var caseInfo = eval("(" + msgContext + ")");
	log(
		'<font color="red">新案件请求接入，已通知用户忙碌请稍后，案件号：' +
		caseInfo.caseNo +
		"</font>"
	);
}

function forceQuite(msg) {
	var msg =
		"<font color='yellow' size='5'>您的账号已经在其他地方登录,请知悉</font>";
	showAlert(msg);
	setTimeout(function() {
		goToIndex();
	}, 2000);
}
// 视频地址设置
function rtmpURLSet(msg) {
	var msgs = msg.split("|");
	var msgContext = msgs[4];
	var msgInfo = eval("(" + msgContext + ")");

	vm.caseData.liNowCaseNo = msgInfo.caseNo;
	vm.caseData.liNowCasePhone = msgInfo.userPhone;
	vm.caseData.rtmpStateId = '案件接入中...'

	// 拉起本地应用程序。
	PushPlay.startEXE({
		data: {
			type: "CustomServiceLive",
			pushURL: msgInfo.downRtmpPush,
			playURL: msgInfo.upRtmpPlay,
			title: "视频连线(视频连线开始请勿关闭)",
			logoUrl: "http://liteavsdk/logo/doubleroom_logo.png"
		},
		custom: {
			// 可选参数
			top_window: false // 默认false,是否置顶窗口。可以不设置，默认不开启
		},
		success: function(ret) {},
		fail: function(ret) {
			alert(ret.errMsg);
			if(ret.errCode == -1) {
				alert("exe未安装");
				showAlertUrl();
			} else {
				alert("出错啦");
			}
		}
	});
}
// 视频开始
function rtmpStart(msg) {
	setTimeout(function() {
		log('开始视频连线')
	}, 200);
}

function rtmpEnd(msg) {
	canRefresh = false;
	PushPlay.stopEXE();
	endRtmpAction();
	setTimeout(function() {
		window.location.reload();
	}, 100);
}

var hideLeftListes = function() {
	$(".leftModel").show();
};

function snapShotPusher() {
	if(isTakephoto){
		isTakephoto = false;
		console.log('%caction player','color:#772aa5')
		PushPlay.videoSnapshot({
			data: {
				userRole: "player"
			}
		});	
		
		setTimeout(function() {
			isTakephoto = true
		}, 1000);
	}else{
		layer.msg('请间隔1秒后拍照', {
			time: 500
		});
	}
	
	
}
var showLeftListes = function() {
	$(".leftModel").hide();
};
//获取房间号接口
function sendMsgAjaxTRTC(msg,haveTrue){
	orderId = msg.orderId;
	var username = msg.username;
	var userSessionId =  $.parseJSON( sessionStorage.getItem("logins"));
	userSessionId = JSON.parse(userSessionId);
	userCode = userSessionId.userCode;
	var para = {
	   "orderId":orderId,
	   "clickAgree":haveTrue,
	   "username":userCode
	}
	myajaxTRTC("judgePCAgree","h5",para,function(data){
		console.log("judgePCAgrss调用成功  出参",data);
		if(data.resCode == "0000"){
			// sessionStorage.setItem("roomNo",data.resultContent.roomNo);
			$("#roomId").val(data.resultContent.roomNo);
			$("#userId").val(userCode);
			vm.start();
			enterRoomAJAX(userCode,data.resultContent.roomNo);
		}
	});
}
function enterRoomAJAX(userCode,roomNo){
	var para = {
		"username":userCode,
		"roomNo":roomNo
	}
	myajaxTRTC("enterRoom","h5",para,function(data){
		console.log("enterRoom调用成功  出参:",data);
		if(data.resCode == "0000"){
			vm.enterRoom();
		}
	});
}
function sendMsgAjax(msg, success) {
	console.info('%csendMsg:', 'color:blue', msg)
	myajax("rtmp/sendMsg.do", {
		msg: msg
	}, function(result) {
		try {
			result = eval("(" + result + ")");
			if(result.resCode == "0000") {
				$("#sendMsgTextareaId").val("");
				if(success) {
					success()
				}
			} else {
				alert(result.resMsg);
			}
		} catch(err) {}
	});
}

function endRtmpAction() {
	var ctime = getCurrentTime();
	canRefresh = false;
	msg = "322|" + vm.userInfo.userCode + "|" + vm.caseData.liNowCasePhone + "|" + ctime + "|" + vm.caseData.linkId;
	sendMsgAjax(msg, function() {
		sessionStorage.removeItem("video");
	});
}

function pcEndRtmpAction(type) {
	canRefresh = false;
	PushPlay.stopEXE();
	var flag = "1"
	msg = "322|" + vm.userInfo.userCode + "|" + vm.caseData.liNowCasePhone + "|" + flag + "|" + vm.caseData.linkId;
	sendMsgAjax(msg, function() {
		sessionStorage.removeItem("video");
		if(!type) {
			window.location.reload();
		}

	});
}
/**
 * 返回时间戳
 */
function getCurrentTime() {
	return new Date().getTime();
}

function loopReq() {
	myajax("rtmpPage/loopRequest.do", {
		userCode: vm.userInfo.userCode
	});
}

function startSocket() {
	// connect();
	// window.setInterval(loopReq, 1000 * 1800);
}
// $(function() {
// 	initData(function() {
// 		// webSocketUrl = result.bean.webSocketUrl;
// 		// socketJsUrl = config.configDatas.socketJsUrl+loginInfo.userCode;
// 		startSocket()
// 		var loginInfo = getLogins();
// 		loginInfo = JSON.parse(loginInfo);
// 		console.log('%cloginInfo', 'color:blue', loginInfo)
// 		
// 		if(!loginInfo || !loginInfo.userCode) {
// 			goToIndex();
// 			return;
// 		}
// 		var obj = {
// 			userCode: loginInfo.userCode
// 		};
// 		vm.userInfo.userCode = loginInfo.userCode;
// 		vm.userInfo.userName = loginInfo.userName ? loginInfo.userName : '未知';
// 		vm.findCaseList(loginInfo.userCode);
// 		myajax("suntrtc/sunMain.do", obj, function(result) {
// 			result = JSON.parse(result);
// 			if(result.resCode != "0000") {
// 				alert(result.resMsg);
// 				goToIndex();
// 				return;
// 			} else {
// 				webSocketUrl = result.bean.webSocketUrl;
// 				socketJsUrl = config.configDatas.socketJsUrl+loginInfo.userCode;
// 				console.log('阳光保险',socketJsUrl)
// 				startSocket()
// 				$('.ctt2').show();
// 				vm.getSignSwitch(function(s) {
// 					let data = JSON.parse(s);
// 					if(data.resCode == '0000') {
// 						if(data.bean == '1') {
// 							vm.userInfo.showUserSign = true;
// 							vm.getUserItemData()
// 						} else {
// 							vm.userInfo.showUserSign = false;
// 						}
// 					} else {
// 						vm.userInfo.showUserSign = false;
// 						alert(data.resMsg)
// 					}
// 				})
// 			}
// 		});
// 	})
// });

// 退出登录 跳转到登录页面
function logOut() {
	goToIndex();
}
// 结束视频
function stopRtmpAction() {
	var msg = "<font color='yellow' size='5'>视频连线已经断开</font>";
	showAlert(msg);
	vm.caseData.liNowCaseNo = '暂无';
	vm.caseData.netStatusId = '暂无';
	vm.caseData.liNowCasePhone = '暂无';
	vm.caseData.rtmpStateId = '暂无接入'
	showLeftListes();
	window.location.reload(); // 页面刷新
}

function zip() {
	var zip = new JSZip();
	// 创建images文件夹
	var imgFolder = zip.folder("images");

	var arr = vm.pageData.getImgList;
	var flag = 0;
	if(arr == null || arr.length == 0) {
		alert("没有可下载照片，请确认选择");
		return;
	}
	downZip(0)

	function downZip(i) {
		console.log(i)
		getBase64(arr[i]).then(
			function(base64) {
				base64 = base64.split("base64,")[1];
				imgFolder.file(i + ".png", base64, {
					base64: true
				});
				if(flag === arr.length - 1) {
					zip.generateAsync({
						type: "blob"
					}).then(blob => {
						saveAs(blob, "picture.zip");
					});
				}
				flag++;
				if(i + 1 < arr.length) {
					downZip(i + 1)
				}
			},
			function(err) {
				console.log(err); // 打印异常信息
			}
		);
	}
	// for(var i = 0; i < arr.length; i++) {}

	function getBase64(img) {

		function getBase64Image(img, width, height) {
			// width、height调用时传入具体像素值，控制大小
			// ,不传则默认图像大小
			var canvas = document.createElement("canvas");
			canvas.width = width ? width : img.width;
			canvas.height = height ? height : img.height;

			var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			var dataURL = canvas.toDataURL();
			return dataURL;
		}
		var image = new Image();
		image.crossOrigin = "";
		image.src = img.picUrl;
		var deferred = $.Deferred();
		if(img) {
			image.onload = function() {
				deferred.resolve(getBase64Image(image)); // 将base64传给done上传处理
			};
			return deferred.promise(); // 问题要让onload完成后再return
			// sessionStorage['imgTest']
		}
	}
}
/**
 * 图片回写影像服务器
 */
function upImg() {
	if(vm.caseData.caseNo == "") {
		alert("事故号不存在");
		return;
	}
	if(vm.pageData.getImgList.length < 1) {
		alert("请拍照后上传");
		return;
	}
	if(canRefresh) {
		alert("请不要在视频连线中上传照片");
		return;
	}
	log("影像上传中: " + vm.caseData.caseNo);
	myajax(
		"rtmpPage/upPicsToOss.do", {
			caseNo: vm.caseData.caseNo,
			userPhone: vm.caseData.casePhone,
			caseSource:vm.caseData.caseNo.substring(0,1)=='C'?'1':'2'
		},
		function(result) {
			var resObj = eval("(" + result + ")");
			if(resObj.resCode == "0000") {
				alert("影像上传成功");
				log("影像上传成功: " + vm.caseData.caseNo);
				vm.findPicture(vm.caseData.caseNo);
			} else {
				alert(resObj.resMsg);
				log("影像上传" + resObj.resMsg + ":" + vm.caseData.caseNo);
				vm.findPicture(vm.caseData.caseNo);
			}
		}
	);
}
/**
 * 删除照片
 */
function delImg() {

	vm.pageData.getPicIndexList = [vm.pageList.lightImg];
	delListImg('');
	return;
	var picId = vm.pageData.getViewerImgList[vm.pageList.lightImg].id;
	myajax("rtmpPage/delPicById.do", {
		id: picId
	}, function(result) {
		var resObj = JSON.parse(result);
		if(resObj.resCode == "0000") {
			alert("删除成功");
			vm.findPicture(vm.caseData.caseNo);
		} else {
			alert("删除失败");
		}
	});
}

/**
 * 批量删除
 */
function delListImg(type) {
	var sign = false;
	for(var i = 0; i < vm.pageData.getViewerImgList.length; i++) {
		if(vm.picOnClick(i)) {
			var sign = true;
			showModal({
				title: type + '删除',
				content: '是否确认' + type + '删除？',
				success: function(boo) {
					if(boo) {
						let imgIdList = []
						for(var i = 0; i < vm.pageData.getViewerImgList.length; i++) {
							if(vm.picOnClick(i)) {
								imgIdList.push({
									picId: vm.pageData.getViewerImgList[i].id
								})
							}
						}
						let obj = {
							imgIdList: JSON.stringify(imgIdList)
						}
						console.log(imgIdList)
						myajax('rtmpPage/delPicListById.do', obj, function(requset) {
							var data = JSON.parse(requset)
							log('批量删除：' + JSON.stringify(data.resMsg), '#ff881c')
							if(data.resCode == '0000') {
								// vm.git();
								for(var j = 0; j < imgIdList.length; j++) {
									for(var i = 0; i < vm.pageData.getImgList.length; i++) {
		
										console.log('i' + i, vm.pageData.getImgList[i].id)
										console.log('j' + j, imgIdList[j].picId)
										if(vm.pageData.getImgList[i].id == imgIdList[j].picId) {
											vm.pageData.getImgList.splice(i, 1);
										}
									}
								}
								vm.viewerImg()
							}
						})
					}
				}
			})
		}
	}
	if(sign == false){
		alert('未选中照片！')
		return;
	}
}

function initSDK() {
	PushPlay.setListener({
		onRecvEvent: function(cmd) {
			if(cmd.eventID == 2010) {
				var temp = cmd;
				if(temp.params[0].value == 0) {
					var path = temp.params[1].value;
					var tempPath = path;
					var tmpdiv = "";
					console.log("路径为" + path);
					console.log("参数为" + temp.params[2].value);
					var element = document.getElementById("takephoto");
					element.src = "data:image/jpeg;base64," + temp.params[2].value;
					saveAliYun();
				}
			}
		}
	});
}

function uninitSDK() {
	PushPlay.unload();
}
/**
 * 后端拍照给图片添加水印
 */

var imgTogether = function(url, callback) {
	$('#myCanvas').remove()
	var shuyin = document.getElementById("shuiyin");
	var img = new Image();
	img.src = url;
	// 加载完成开始绘制
	img.onload = function() {

		// 准备canvas环境
		$('#myCanvasDiv').append('<canvas id="myCanvas" width="' + img.width + '" height="' + img.height + '" ></canvas>')
		var canvas = document.getElementById("myCanvas");
		$('#myCanvas').width(img.width);
		$('#myCanvas').height(img.height);
		var ctx = canvas.getContext("2d");

		// 绘制图片
		ctx.drawImage(img, 0, 0);
		ctx.drawImage(shuyin, img.width - 80, img.height - 90, 50, 40);
		// 绘制水印
		ctx.font = "14px 宋体  ";
		ctx.fillStyle = "rgba(253, 115, 24,0.9)";
		ctx.fillText("WX" + vm.userInfo.userCode, img.width - 100, img.height - 30);
		ctx.fillText(timeFormat(new Date(), 'yyyy-MM-dd hh:mm:ss'), img.width - 160, img.height - 15);

		// console.log(canvas.toDataURL("image/jpeg"));
		callback(canvas.toDataURL("image/jpeg"));
	};
};
// $('.lst2').resize(function(){
// 	var width = $('.lst2').width();
// 	$('#root').width(width);
// })

function showTimeToWate() {
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();
	return(
		year + "年" + month + "月" + day + "日" + hour + ":" + minute + ":" + second
	);
}

function toBlob(urlData, fileType, success) {
	var test = urlData.split(",")[1].replace(/\%0D%0A/g, "");
	// var binary = atob(urlData.split(',')[1]);
	var binary = atob(test);
	var array = [];
	for(var i = 0; i < binary.length; i++) {
		array.push(binary.charCodeAt(i));
	}
	// return new Blob([new Uint8Array(array)], {type:fileType });
	success(new Blob([new Uint8Array(array)], {
		type: fileType
	}));
}
var js_date_time = function() {
	var date = new Date();
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	m = m < 10 ? ('0' + m) : m;
	var d = date.getDate();
	d = d < 10 ? ('0' + d) : d;
	var h = date.getHours();
	h = h < 10 ? ('0' + h) : h;
	var minute = date.getMinutes();
	var second = date.getSeconds();
	minute = minute < 10 ? ('0' + minute) : minute;
	second = second < 10 ? ('0' + second) : second;
	return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second; //年月日时分秒
};
/**
 * 后端拍照给图片保存到阿里云服务器并且存入数据库
 */
function saveAliYun(takeUrl) {
	businessNo = sessionStorage.getItem("businessNo");
	var blob;
	// $("#loading").show();
//	var takeUrl = document.getElementById("takephoto").src;
	imgTogether(takeUrl, function(url) {
		toBlob(url, "image/jpeg", function(data) {
			blob = data;
			// blob转arrayBuffer
			var reader = new FileReader();
			reader.readAsArrayBuffer(blob);
			reader.onload = function(event) {
				// 配置
				var client = new OSS.Wrapper({
					region: config.configDatas.Wrapper.region,
					accessKeyId: config.configDatas.Wrapper.accessKeyId,
					accessKeySecret: config.configDatas.Wrapper.accessKeySecret,
					bucket: config.configDatas.Wrapper.bucket,
					secure:true,
					stsToken:config.configDatas.Wrapper.stsToken
				});
				// 文件名
				var date = new Date();
				var time = "" + date.getFullYear();
				var storeAs =
					"Uploads/file/" +
					time +
					"/" +
					date.getTime() +
					"." +
					blob.type.split("/")[1];

				// arrayBuffer转Buffer
				var buffer = new OSS.Buffer(event.target.result);
				// 上传
				client
					.put(storeAs, buffer, {
						headers: {
							"Cache-Control": "no-cache"
						}
					})
					.then(function(result) {})
					.catch(function(err) {
						console.log(err);
					});
				var url = client.signatureUrl(storeAs);
				//正则取出地址关键字段
    			var reg = /http[s]*:\/\/(.*aliyuncs.com\/.*\?.*)/i;
    			var picturePath = url//.replace(reg, "https:\/\/$1");
				console.log(url)
				// vm.imgDataList.push({"image":url});
				// console.log(vm.imgDataList);
				// var para = {
				//     "businessNo": businessNo,
				//     "pictureTimeStamp":js_date_time(),
				//     "picturePath":picturePath,
				//     "pictureLength":"pictureLength",
				//     "pictureSize":"pictureSize",
				//     "pictureFormat":"pictureFormat",
				//     "pictureSource":"PC",
				//     "pictureProducer":vm.userInfo.userName,
				//     "pictureOperator":sessionStorage.getItem("reqUserName") ||""
				// }
				var keywords = {
					'pictureTimeStamp':js_date_time(),
					'businessNo':businessNo,
					'picturePath':picturePath,
					'pictureLength':'pictureLength',
					'pictureSize':'pictureSize',
					'pictureFormat':'pictureFormat',
					'pictureProducer':vm.userInfo.userName + '-PC',
					'pictureOperator':sessionStorage.getItem("reqUserName") + '-PC',
					"pictureSource": "PC",
					'sdkType':'carclaim',
					'caseNo':sessionStorage.getItem("orderId"),
					'estimateNo':''
				}
				console.log("uploadPicCallback调用成功    入参:  ",keywords);
				$("#loading").hide();
				myajaxTRTC("uploadPicCallbackPro",keywords,function(data){
					if(data.resCode == '0000'){
						console.log("uploadPicCallback调用成功    回参:  ",data);
					}
				})
				
				
			};
		});
	});
}
function getPicList(){
	var para = {
	   "orderId":orderId,
	   "businessNo":businessNo
	}
	$("#loading").show();
	setTimeout(function(){
		myajaxTRTC("getPictureList","h5",para,function(data){
			if(data.resCode == "0000"){
				$('#screenshot').viewer('destroy');
				setTimeout(function(){
					var pictureList = data.resultContent;
					vm.imgDataList = data.resultContent;
					$("#loading").hide();
				},1000)
			}
		});
	},1000)
}
/**
 * 旋转保存到阿里云
 */
function saveAliYunForFlip(url, success) {
	let blob;
	var takeUrl = url;
	toBlob(url, "image/jpeg", function(data) {
		blob = data;
		console.log(blob)
		// blob转arrayBuffer
		var reader = new FileReader();
		reader.readAsArrayBuffer(blob);
		reader.onload = function(event) {
			// 配置
			var client = new OSS.Wrapper({
				region: config.configDatas.Wrapper.region,
				accessKeyId: config.configDatas.Wrapper.accessKeyId,
				accessKeySecret: config.configDatas.Wrapper.accessKeySecret,
				bucket: config.configDatas.Wrapper.bucket,
				secure:true
			});
			// 文件名
			var date = new Date();
			var time = "" + date.getFullYear();
			var storeAs =
				"Uploads/file/" +
				time +
				"/" +
				date.getTime() +
				"." +
				blob.type.split("/")[1];

			// arrayBuffer转Buffer
			var buffer = new OSS.Buffer(event.target.result);
			// 上传
			client
				.put(storeAs, buffer, {
					headers: {
						"Cache-Control": "no-cache"
					}
				})
				.then(function(result) {})
				.catch(function(err) {
					console.log(err);
				});
			var url = client.signatureUrl(storeAs, {
				expires: 86400
			});
			// url = url.replace(/http/, "https");
			success(url);
			blob = undefined;
		};
	});
}
/**
 * 封装的方法
 */

function getImgBase64(imgUrl, success) {
	window.URL = window.URL || window.webkitURL;
	var xhr = new XMLHttpRequest();
	xhr.open("get", imgUrl, true);
	// 至关重要
	xhr.responseType = "blob";
	xhr.onload = function() {
		if(this.status == 200) {
			// 得到一个blob对象
			let blob = this.response;
			console.log("blob", blob)
			// 至关重要
			let oFileReader = new FileReader();
			oFileReader.onloadend = function(e) {
				let base64 = e.target.result;
				success(base64)
			};
			oFileReader.readAsDataURL(blob);
		}
	}
	xhr.send();
}
/**
 * 弹窗
 */
var showAlertUrl = function() {
	$("body").append(
		'<div class="myAlert">' +
		'<div class="alertMain">' +
		'<div class="alertImg"><img src="homecssimg/error.png" /></div>' +
		'<div class="reload">您的电脑还没有安装视频连线软件，您必须安装该软件才能正常进行工作</br>请您点击下载，成功安装该软件后刷新此页面，您可按“F5”或点击“刷新”按钮进行刷新</br>如果问题没有得到解决，请您联系IT管理员进行处理！</div>' +
		'<div class="alertBtn"><button class="reloadBtn" onclick="reloadThisPage()">刷新</button><button class="downLoadBtn" onclick="downLoadExe()">下载</button></div>' +
		"</div></div>"
	);
	pcEndRtmpAction(true);
};
var reloadThisPage = function(text) {
	location.reload();
};


function showAlert(msg) {
	var someHtml =
		'<div id="alertId">' +
		'<div onclick="hideAlert()" style="top:420px;left:40%;position:absolute;background:rgba(51,51,51,0.5);padding:20px;">' +
		msg +
		"</div></div>";
	$("body").append(someHtml);

	setTimeout(hideAlert, 3000);
}

function hideAlert() {
	$("#alertId").remove();
}
var heightCenter = $(window).height();
heightCenter = heightCenter-60;
var ls2Height = heightCenter-40
heightCenter = heightCenter+'px'
ls2Height = ls2Height +'px'
$('.center').css('height',heightCenter);
$('.lst2').css('height',ls2Height);
$('.ul_b').css('height',ls2Height);
window.showModal = function(o) {
	$("#cue").remove();
	let obj = {
		title: '提示',
		content: '',
		doubleBtn: false,
		success: function() {}
	}
	let inner = '<div id="cue"><div class="cueMain">';
	inner += '<div class="cueTitle">' + o.title + "</div>";
	inner +=
		'<div class="cueText"><div class="cue-text">' + o.content + "</div></div>";
	inner += '<div class="cueBtn">';
	inner += '<button id="yes" onclick="returnConfirm(true)">确认</button>';
	inner += '<button id="no" onclick="returnConfirm(false)">取消</button>';
	inner += "</div></div></div>";
	$("body").append(inner);
	if(o.success) {
		confirmSuccess = o.success;
	}
};
var returnConfirm = function(boo) {
	$("#cue").remove();
	confirmSuccess(boo);
};
var confirmSuccess = function() {};

/**
 * 时间格式化
 */
function timeFormat(thisDate, fmt) {
	var o = {
		"M+": thisDate.getMonth() + 1, // 月份
		"d+": thisDate.getDate(), // 日
		"h+": thisDate.getHours(), // 小时
		"m+": thisDate.getMinutes(), // 分
		"s+": thisDate.getSeconds(), // 秒
		"q+": Math.floor((thisDate.getMonth() + 3) / 3), // 季度
		"S": thisDate.getMilliseconds(), // 毫秒
		"D": thisDate.getDay() // 星期
	};
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (thisDate.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	for(var k in o) {
		if(new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}
// 消息展示
window.log = function(msg, color) {
	console.log(msg, color);
}
var oldAlert = window.alert;
window.alert = function(text) {
	myLayer({
		type: 1,
		content: text,
	})
}
var myLayer = function(o) {
	let obj = {
		type: 1,
		content: '',
		success: function(a) {
			console.log(a)
		},
		title: '提示',
		open: 'alert',
		color: '#FFFFFF',
		logColor: ''
	}
	obj = $.extend(true, obj, o);
	switch(obj.type) {
		case 1:
			obj.title = '提示';
			obj.open = 'alert';
			obj.color = '#FFFFFF';
			log('提示' + obj.content)
			break;
		case 2:
			obj.title = '错误';
			obj.open = 'alert';
			obj.color = 'red';
			log('错误' + obj.content, 'red')
			break;
		case 3:
			obj.title = '选择';
			obj.open = 'confirm';
			obj.color = '#FFFFFF';
			break;
	}

	layer[obj.open](obj.content, {
		btnAlign: 'c',
		title: [obj.title, 'background-color:#2e8ded;text-align:left;color:' + obj.color + ';border-color:#4898d5;'],
		skin: 'menu-userIcon',
		yes: function(index, layero) {
			obj.success(layero);
			layer.close(index);
		}
	})
}
