/**
 * Copyright © 2020 SIG.Co.Ltd. All rights reserved.
 * 
 * @author: Bruce
 * 
 * */
var userName = '';
var groupId = "";
var vm = new Vue({
	
	el: '#root',
	data:{
		isVideo:false,
		isActive:false,
		isPhone:false,
		success:false,
		messageShow:false,
		isOpenMic:true,
		isCamera:true,
		userName:'',
		locationVideo:false,
		// iFlogin:true,
		reqUserName:'',//视频发起人
		respUsername:'',//被呼叫人
		uuid:'',
		message:{
			text:''
		},
		aliYunConfigData:{
			region:'',
			accessKeyId:'',
			accessKeySecret:'',
			bucket:'',
		},
		h:0,//定义时，分，秒，毫秒并初始化为0；
		m:0,
		s:0,
		ms:0,
		time:0, //定时器
		times:'', //统计共多少秒时间
		videoTime:'00:00:00',
		userInfo:{
			userList:[],
			userCode:''
		},
		messageInfo:{
			message:'',
			messageList:[]
		},
		imgDataList:[],
		memberList:[],
		isClick:false,
		str:'',
		roomNo:'',
		imSdkData:{
			id:'',
			key:''
		}
		
	},
	methods:{
		phoneMouseOve:function(){
			var self = this
			vm.isActive = true;
			vm.userInfo.userList = [];
			var uobj = {
				username:userName,
				page:"1",
				pageCount:"200"
			}
			myajaxTRTC("userStatusListPro",uobj,function(ures){
				if(ures.resCode=="0000"){
					vm.isPhone = true;
					for(var i = 0;i < ures.resultContent.length;i ++){
						if(ures.resultContent[i].userCode == userName){
							ures.resultContent.splice(i,1)
						}
						if(ures.resultContent[i]){
							if(ures.resultContent[i].userStatus  == '0'){
								ures.resultContent[i].userStatus = '在线'
							}else{
								ures.resultContent[i].userStatus = '离线'
							}
						}
						
					}
					vm.userInfo.userList = ures.resultContent
					console.log(vm.userInfo.userList,ures.resultContent)
				}else{
					self.$Message.error("系统异常");
					return;
				}
			})
		},
		phoneMouseLeave:function(){
			if(!vm.isPhone){
				vm.isActive = false;
			}
		},
		phoneClose:function(){
			vm.isActive = false;
			vm.isPhone = false;
		},
		linkVideo:function(item){
			if(item.userStatus!='在线'){
				return;
			}
			var self = this
			vm.userInfo.userCode = userName;
			vm.respUsername = item.userCode;
			sessionStorage.setItem("orderId", "R" + item.userCode)
			if(!self.roomNo){
				var obj={
					userName:userName + '-PC',
					needPassword:'N',
					password:'',
					orderId:'R' + userName,
					reportName:userName,
					link :'007'
				}
				myajaxTRTC("createRoomPro",obj,function(response){
					console.log("createRoomPro",response)
					sessionStorage.setItem("roomNo", response.resultContent.roomNo)
					self.roomNo = response.resultContent.roomNo
					self.callSury(item)
				})
			}else{
				sessionStorage.setItem("roomNo", self.roomNo)
				self.callSury(item)
			}
			
			
		},
		callSury: function(item){
			var str = item.platform == '小程序'?'MINIPROGRAM':item.platform
			var obj = {
				orderId:'R' + userName,
				reportName:userName,
				reqUserName:userName + '-PC',
				roomNo:sessionStorage.getItem("roomNo"),
				sdkType:'carclaim',
				userGroup:[{
					respUserName:item.userCode + '-' + str,
					receiverName:item.userCode
				}]
			}
			vm.str = str
			myajaxTRTC("callSurveyorPro",obj,function(res){
				if(res.resCode=="0000"){
					vm.isVideo = true;
					// vm.isPhone = false;
					$("#loading").show();
					// newWebSocket(item.userName)
				}else{
					self.$Message.error("系统异常");
					return;
				}
			})
		},
		videoStart:function(){  //开始
		    vm.time=setInterval(vm.timer,50);
			vm.isClick = true;
		},
		linkTop:function(){  //暂停
		    clearInterval(this.time);
		},
		linkReset:function(){  //重置
			clearInterval(this.time);
			this.h=0;
			this.m=0;
			this.ms=0;
			this.s=0;
			this.str="00:00:00";
		},
		timer:function(){                //定义计时函数
			vm.ms=vm.ms+50;        //毫秒
			if(vm.ms>=1000){
				vm.ms=0;
				vm.s=vm.s+1;        //秒
			}
			if(vm.s>=60){
				vm.s=0;
				vm.m=vm.m+1;       //分钟
			}
			if(vm.m>=60){
				vm.m=0;
				vm.h=vm.h+1;        //小时
			}	
			vm.videoTime =vm.toDub(vm.h)+":"+vm.toDub(vm.m)+":"+vm.toDub(vm.s);
			//统计共看了多少秒
			vm.times=vm.s + vm.m*60 + vm.h*3600 ;
		},
		toDub:function(n){  //补0操作
			if(n<10){
				return "0"+n;
			}else {
				return ""+n;
			}
		},
		//取消视频邀请
		hangup:function(){
			var self = this
			var keywords = {
			  reqUserName:userName + '-PC',
			  reportName:vm.respUsername,
			  respUserGroup:[vm.respUsername + '-' + vm.str],
			  sdkType:'carclaim'
			}
			myajaxTRTC("callSurveyorCancleActionPro",keywords,function(res){
				if(res.resCode=="0000"){
					$("#loading").hide();
					
				}else{
					self.$Message.error("系统异常");
				}
			})
		},
		//关闭开启摄像头
		switchCamera:function(){
			if(vm.isCamera){
				vm.isCamera = false
				muteVideo();

				
			}else{
				vm.isCamera = true;
				unmuteVideo();

			}
		},
		//静音
		mucChanged:function(){
			vm.isOpenMic = !vm.isOpenMic
			if(vm.isOpenMic){
				unmuteAudio();
			}else{
				muteAudio();
			}
		},
		//挂断
		leaveRoom:function(){
			vm.isVideo = false;
			vm.isClick = false;
			vm.memberList = [];
			vm.messageInfo.messageList = [];
			
			leave();
			vm.linkTop();
		},
		//拍照
		takePhoto:function(){
			remoteVideoFrame();
		},
		//接收视频
		acceptLink:function(type){
			var self = this
			if(type == '2'){
				$('#linkModel').hide();
			}
			var status = ''
			if(type == '1'){
				status = 'Y'
			}else{
				status = 'N'
			}
			self.judgePC(status)
		},
		judgePC:function(status){
			var self = this
			var keywords = {
				orderId: sessionStorage.getItem('orderId'),
				clickAgree:status,
				reqUserName:sessionStorage.getItem('reqUserName'),
				respUserName:userName + "-PC",
				roomNo:sessionStorage.getItem('roomNo'),
				receiverName:userName,
				sdkType:'carclaim',
			}
			myajaxTRTC("judgeAgreePro",keywords,function(res){
				console.log('judgeAgreePro',res)
				if(res.resCode=="0000"){
					if(status == 'Y'){
						self.enterRoom(2)
					}
				}
			})
		},
		//进入房间
		enterRoom:function(status){
			var self = this
			vm.uuid = this.guids()+'-' +userName + '-PC'
			var para = {
				userName:vm.uuid,
				surName:userName,
				roomNo:sessionStorage.getItem('roomNo'),
				streamId:sessionStorage.getItem('roomNo') +'_' + vm.uuid +'_main',
				caseSource:'1',
				videoManIdentity:status,
				orderId:sessionStorage.getItem('orderId'),
				sdkType:'carclaim',
			}
			myajaxTRTC("enterRoomSuccessPro",para,function(data){
				console.log("enterRoom调用成功  出参:",data);
				if(data.resCode == "0000"){
					$('#linkModel').hide();
					vm.isVideo = true;
					login();
				}else{
					self.$Message.error("系统异常");
					return;
				}
			});
		},
		// 生成uuid
		guids:function() {
			var s = [];
			var hexDigits = "0123456789abcdef";
			for (var i = 0; i < 36; i++) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			}
			s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
			s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
			s[8] = s[13] = s[18] = s[23] = "-";
		 
			var uuid = s.join("");
			return uuid.substring(0,8);
		},
		//发送消息
		sendMsg:function(){
			var self = this
			var groupId = self.roomNo

			if(!groupId){
				console.log("未加入房间!");
				return;
			}
			if(vm.messageInfo.message == ""){
				self.$Message.error("请输入消息文本");
				return;
			}
			var keywords = {
				'sender':userName,
				"sdkType": "carclaim",
				"businessNo": sessionStorage.getItem("businessNo"),
				"message": vm.messageInfo.message
				
			}
			myajaxTRTC("sendImMultiActionPro",keywords,function(res){
				console.log(res)
				vm.messageInfo.message = ""
			})
			
		},
		uploadPic:function(event){
			var self = this
			var groupId = sessionStorage.getItem("roomId")
			
			 var reader = new FileReader();
			var fileData = self.$refs.InputFile.files[0];
			if(!fileData){
				return;
			}
			 // 1. 创建消息实例，接口返回的实例可以上屏
			  let message = tim.createImageMessage({
			    to: groupId,
			    conversationType: TIM.TYPES.CONV_GROUP,
			    payload: {
					name:userName,
					type:'1',
			      file: fileData
			    },
			    onProgress: function(event) { console.log('file uploading:', event) }
			  });
			
			  // 2. 发送消息
			  let promise = tim.sendMessage(message);
			  promise.then(function(imResponse) {
			    // 发送成功
			    console.log(imResponse);
				vm.messageInfo.messageList.push({
				  name:userName,
				  type:'1',
				  file:imResponse.data.message.payload.imageInfoArray[1].imageUrl
				})  	
			  }).catch(function(imError) {
			    // 发送失败
				self.$Message.error('sendMessage error:', imError);
			  });
			
		},
		// 解密
		decrypt:function(message) {
			var base64 = CryptoJS.enc.Utf8.parse('密钥')
			var text = message;
			var decrypt = CryptoJS.TripleDES.decrypt(text, base64, {
					iv: CryptoJS.enc.Utf8.parse('向量'),
					mode: CryptoJS.mode.CBC,
					padding: CryptoJS.pad.Pkcs7
				}
			);
			//解析数据后转为UTF-8
			var parseData = decrypt.toString(CryptoJS.enc.Utf8);
			console.log(parseData)
			return parseData
		},
		// 退出
		closeOut:function(){
			var lobj = {
				Info:{
					"To_Account": vm.userName + "-PC",
					"Action":"",
				}
			};
			myajaxTRTC("userStatusPro",lobj,function(res){
				if(res.resCode=="0000"){
					location.href = "login.html"
				}
			})
		}
	},
	mounted:function() {
		var self = this
		userName = sessionStorage.getItem("userId");
		groupId = sessionStorage.getItem("roomId");
		
		this.userName = userName;
		var obj = {
			sdkType:'carclaim'
		}
		myajaxTRTC("getIMLogin",obj,function(res){
			console.log("getIMLogin",obj)
			if(res.resCode == '0000'){
				if(userName){
					var timSDK = {
						id:parseInt(self.decrypt(res.resultContent.imappid)),
						key:self.decrypt(res.resultContent.imkey)
					}
					
					sessionStorage.setItem("timSDK",JSON.stringify(timSDK))
					console.log(config)
					myajaxTRTC("aliYunToken",{},function(res){
						console.log(res)
						if(res.resCode == '0000'){
							config.configDatas.Wrapper.accessKeyId = res.bean.accessKeyId
							config.configDatas.Wrapper.accessKeySecret = res.bean.accessKeySecret
							config.configDatas.Wrapper.stsToken = res.bean.securityToken
						}
					})
					sdkDatas = genTestUserSig(userName+'-PC',timSDK)
					connect(userName,sdkDatas)
				}else{
					location.href = "login.html";
				}
			}
			
		})
	},
	
})
 $('#sendBtn').bind('keyup', function(event) {
	if (event.keyCode == "13") {
		console.log(vm.messageInfo.message)
		vm.sendMsg();
		
	}
});

