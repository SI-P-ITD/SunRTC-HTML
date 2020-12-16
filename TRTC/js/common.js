let isCamOn = true;
let isMicOn = true;
let isScreenOn = false;
let isJoined = true;
let rtc = null;
let share = null;
let shareUserId = '';
let cameraId = '';
let micId = '';
var tim = null;//im聊天室内
let appId = parseInt(JSON.parse(sessionStorage.getItem('timSDK')).id);
let secretKey = JSON.parse(sessionStorage.getItem('timSDK')).key;
let onMessageReceived = null;
let marginRight = 0;


function login() {
    
    presetting.login(false,appId,secretKey, options => {
        rtc = new RtcClient(options);
        join();
		creatIM();
    });
	 presetting.login(true,appId,secretKey, options => {
	    shareUserId = options.userId;
	    share = new ShareClient(options);
	});
   
}
//创建聊天室
function creatIM(){
	 var options = {
	  SDKAppID: parseInt(JSON.parse(sessionStorage.getItem('timSDK')).id) // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
	};
	// 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
	tim = TIM.create(options);
	// 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
	tim.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用
	// tim.setLogLevel(1); // release 级别，SDK 输出关键信息，生产环境时建议使用
	// 注册 COS SDK 插件
	tim.registerPlugin({'cos-js-sdk': COS});
	var userId = sessionStorage.getItem("userId");
	var roomNo = sessionStorage.getItem("roomId");
	var onSdkReady = function(event) {
		
		 onMessageReceived = function(event) {
			  // event.data - 存储 Message 对象的数组 - [Message]
			  console.log('接收消息',event);
			  if(event.data[0].type=="TIMImageElem"){
			  	 vm.messageInfo.messageList.push({
			  	  name:event.data[0].from,
				  type:'1',
			  	  file:event.data[0].payload.imageInfoArray[1].imageUrl
			  	})  			  
			  }else{
				 vm.messageInfo.messageList.push({
				  name:event.data[0].from,
				  type:'2',
				  text:event.data[0].payload.text
				})  
			  }
			  $('#scrolldIV')[0].scrollTop = $('#scrolldIV')[0].scrollHeight+100;
			  $('.chartmsg')[0].scrollTop = $('.chartmsg')[0].scrollHeight+100
		};
		tim.on(TIM.EVENT.MESSAGE_RECEIVED, onMessageReceived);

		var groupID = roomNo;
		// 创建私有群
		var promise = tim.createGroup({
			type: TIM.TYPES.GRP_CHATROOM,
			name: userId,
			groupID: groupID,
			// joinOption: TIM.TYPES.JOIN_OPTIONS_FREE_ACCESS
		});
		promise.then(function(imResponse) { // 创建成功
			console.log(imResponse.data.group); // 创建的群的资料
			//加入
			var promise = tim.joinGroup({
				groupID: groupID,
				type: TIM.TYPES.GRP_CHATROOM
			});
			promise.then(function(imResponse) {
				console.log("创建成功加入群聊",imResponse)
				switch(imResponse.data.status) {
					case TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
						break;
					case TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
						console.log(imResponse.data.group); // 加入的群组资料
						break;
					case TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
						break;
					default:
						break;
				}
			}).catch(function(imError) {
				console.warn('joinGroup error:', imError); // 申请加群失败的相关信息
			});
		}).catch(function(imError) {
			console.log("创建失败",imError)
			//加入
			var promise = tim.joinGroup({
				groupID: groupID,
				type: TIM.TYPES.GRP_CHATROOM
			});
			promise.then(function(imResponse) {
				console.log("创建失败加入群聊",imResponse)
				switch(imResponse.data.status) {
					case TIM.TYPES.JOIN_STATUS_WAIT_APPROVAL: // 等待管理员同意
						break;
					case TIM.TYPES.JOIN_STATUS_SUCCESS: // 加群成功
						console.log(imResponse.data.group); // 加入的群组资料
						break;
					case TIM.TYPES.JOIN_STATUS_ALREADY_IN_GROUP: // 已经在群中
					console.log('群'+groupID+'已在群里'); // 创建群组失败的相关信息
						break;
					default:
						break;
				}
				
			}).catch(function(imError) {
				console.warn('joinGroup error:', imError); // 申请加群失败的相关信息
			});
		});
	};
	
	var promise = tim.login({userID: userId, userSig: window.genTestUserSig(userId).userSig});
	promise.then(function(imResponse){
		console.log("登录成功")
		console.log(imResponse.data); // 登录成功
		tim.on(TIM.EVENT.SDK_READY, onSdkReady);
		
	}).catch(function(imError){
		 console.warn('login error:', imError); // 登录失败的相关信息
	})
}

function join() {
    rtc.join();
    // $('#login-root').hide();
    // $('#room-root').show();
    // $('#header-roomId').html('房间号: ' + $('#roomId').val());
    // $('#member-me').find('.member-id').html($('#userId').val() + '(我)');
}

function leave() {
    $('#mask_main').appendTo($('#main-video'));
    rtc.leave();
    share.leave();
}

function publish() {
    rtc.publish();
}

function unpublish() {
    rtc.unpublish();
}

function muteAudio() {
    rtc.muteLocalAudio();
}

function unmuteAudio() {
    rtc.unmuteLocalAudio();
}

function muteVideo() {
    $('#mask_main').show();
    rtc.muteLocalVideo();
}

function unmuteVideo() {
    rtc.unmuteLocalVideo();
    $('#mask_main').hide();
}

function startSharing() {
    share.join();
}

function stopSharing() {
    share.leave();
}
//截取远端流视频帧
function remoteVideoFrame() {
    var frame = rtc.getRemoteVideoFrame();
    var img = $('<img src="" alt="" />').attr({
	   src:frame,
	   width:"295px",
	   style: "margin-right:2.5px"
	});
//  $("#screenshot").append(img);
    saveAliYun(frame);
}
function setBtnClickFuc() {
    //userid roomid规格
    //$('#userId').on('input', function(e) {
    //    e.preventDefault();
    //    console.log('userId input ' + e.target.value);
    //    let val = $('#userId').val().slice(5);
    //    $('#userId').val('user_'+val.replace(/[^\d]/g,''));
    //});
    $('#roomId').on('input', function(e) {
        e.preventDefault();
        console.log('roomId input ' + e.target.value);
        let val = $('#roomId').val();
        $('#roomId').val(val.replace(/[^\d]/g,''));
    });
    //login
    $('#login-btn').click(() => {
        login();
    });
    //open or close camera
    $('#video-btn').on('click', () => {
        if (isCamOn) {
            $('#video-btn').attr('src', './TRTC/img/big-camera-off.png');
            $('#video-btn').attr('title', '打开摄像头');
            $('#member-me').find('.member-video-btn').attr('src', 'img/camera-off.png');
            isCamOn = false;
            muteVideo();
        } else {
            $('#video-btn').attr('src', './TRTC/img/big-camera-on.png');
            $('#video-btn').attr('title', '关闭摄像头');
            $('#member-me').find('.member-video-btn').attr('src', 'img/camera-on.png');
            isCamOn = true;
            unmuteVideo();
        }
    });
    //open or close microphone
    $('#mic-btn').on('click', () => {
        if (isMicOn) {
            $('#mic-btn').attr('src', './TRTC/img/big-mic-off.png');
            $('#mic-btn').attr('title', '打开麦克风');
            $('#member-me').find('.member-audio-btn').attr('src', 'img/mic-off.png');
            isMicOn = false;
            muteAudio();
        } else {
            $('#mic-btn').attr('src', './TRTC/img/big-mic-on.png');
            $('#mic-btn').attr('title', '关闭麦克风');
            $('#member-me').find('.member-audio-btn').attr('src', 'img/mic-on.png');
            isMicOn = true;
            unmuteAudio();
        }
    });
    //获取视频帧
    $('#photo-btn').on('click', () => {
//      nativeVideoFrame();
		remoteVideoFrame();
    });
    //share screen or not
    $('#screen-btn').on('click', 
        throttle(() => {
            if (!TRTC.isScreenShareSupported()) {
                alert('当前浏览器不支持屏幕分享！');
                return;
            }
            if ($('#screen-btn').attr('src') == './TRTC/img/screen-on.png') {
                $('#screen-btn').attr('src', './TRTC/img/screen-off.png');
                stopSharing();
                isScreenOn = false;
            } else {
                $('#screen-btn').attr('src', './TRTC/img/screen-on.png');
                startSharing();
                isScreenOn = true;
            }
        }, 2000)
    );
    //logout
    $('#logout-btn').on('click', () => {
        leave();
        alert("退出房间");
        $('#room-root').hide();
//      $('#login-root').show();
    });
    //switch main video
    $('#main-video').on('click', () => {
        let mainVideo = $('.video-box').first();
        if ($('#main-video').is(mainVideo)) {
            return;
        }
        //释放main-video grid-area
        // mainVideo.css('grid-area', 'auto/auto/auto/auto');
        exchangeView($('#main-video'), mainVideo);
        //将video-grid中第一个div设为main-video
        // $('.video-box').first().css('grid-area', '1/1/3/4');
        //chromeM71以下会自动暂停，手动唤醒
        if (getBroswer().broswer=='Chrome' && getBroswer().version<'72') {
            rtc.resumeStreams();
        }
    });

    //chrome60以下不支持popover，防止error
    if (getBroswer().broswer=='Chrome' && getBroswer().version<'60')
        return;
    //开启popover
    $(function () {
        $('[data-toggle="popover"]').popover()
    })
    $('#camera').popover({
        html: true,
        content: () => {
            return $('#camera-option').html();
        }
    });
    $('#microphone').popover({
        html: true,
        content: () => {
            return $('#mic-option').html();
        }
    });

    $('#camera').on('click', () => {
        $('#microphone').popover('hide');
        $('.popover-body').find('div').attr('onclick', 'setCameraId(this)');
    });

    $('#microphone').on('click', () => {
        $('#camera').popover('hide');
        $('.popover-body').find('div').attr('onclick', 'setMicId(this)');
    });

    //点击body关闭popover
    $('body').click(() => {
        $('#camera').popover('hide');
        $('#microphone').popover('hide');
    });

    //popover事件
    $('#camera').on('show.bs.popover', () => {
        $('#camera').attr('src', './TRTC/img/camera-on.png');
    });
    $('#camera').on('hide.bs.popover', () => {
        $('#camera').attr('src', './TRTC/img/camera.png');
    });

    $('#microphone').on('show.bs.popover', () => {
        $('#microphone').attr('src', './TRTC/img/mic-on.png');
    });
    $('#microphone').on('hide.bs.popover', () => {
        $('#microphone').attr('src', './TRTC/img/mic.png');
    });
}

function setCameraId(thisDiv) {
    cameraId = $(thisDiv).attr('id');
    console.log('setCameraId: ' + cameraId);
}

function setMicId(thisDiv) {
    micId = $(thisDiv).attr('id');
    console.log('setMicId: ' + micId);
}

function addVideoView(id, isLocal = false) {
 //    let div = $('<div/>', {
 //        id: id,
 //        class: 'video-box',
 //        style: 'justify-content: center;'
 //    });
	// // var addleft = marginRight +
	// div.css("left",marginRight+"px")
 //    div.appendTo('#video-grid');
	// marginRight +=146
	
	let divNum = $('.video-box').length;
	let div = $('<div/>', {
	    id: id,
	    class: 'video-box',
	});
	div.appendTo('#video-grid');
	if(divNum<1){
		$('.video-box').addClass('bigMoon')
		return;
	}
	$('.video-box').eq(divNum).css({
		'width': '200px',
		'height': '25%',
		'position': 'absolute',
		'right':'0',
		'backgroundColor': '#f0f0f0',
		'overflow': 'hidden',
		'zIndex': '9',
		'top':(divNum-1)*25+'%'
	});
	
    //设置监听
    div.click(() => {
        let mainVideo = $('.video-box').first();
        if (div.is(mainVideo)) {
            return;
        }
        //释放main-video grid-area
        // $('#main-video').css('left', marginRight+"px");
		$('#main-video').css({
			'grid-area':'',
			'z-index':99
		})
		$('.main-video-btns').css({
			"top":"250%%",
			"left":"134%"
		})
		$('.video-box').removeClass('bigMoon');
		div.addClass('bigMoon');
		div.css({"z-index":0,"height":"100%"});
        exchangeView(div, mainVideo);
        //将video-grid中第一个div设为main-video
        // $('.video-box').first().css('left', '0');
		// var left2 = $('.video-box'):nth-child(3)
        //chromeM71以下会自动暂停，手动唤醒
        if (getBroswer().broswer=='Chrome' && getBroswer().version<'72') {
            rtc.resumeStreams();
        }
    });
	 $('#main-video').on('click', () => {
	    let mainVideo = $('.video-box').first();
	    if ($('#main-video').is(mainVideo)) {
	        return;
	    }
		$('#main-video').css({
			'grid-area':'1/1/4/6',
			'z-index':0
		})
		$('.video-box').removeClass('bigMoon');
		$('.main-video-btns').css({
			"top":0,
			"left":"34%"
		})
		// var left2 = $('.video-box').eq(2).css('left');
		// if(left2 == "0px"){
		// 	$('.video-box').eq(2).css('left',marginRight+"px")
		// }
	    //释放main-video grid-area
	    // $('#main-video').css('left', marginRight+"px");
	    exchangeView($('#main-video'), mainVideo);
	    //将video-grid中第一个div设为main-video
	    $('.video-box').first().css('left', '0');
	    //chromeM71以下会自动暂停，手动唤醒
	    if (getBroswer().broswer=='Chrome' && getBroswer().version<'72') {
	        rtc.resumeStreams();
	    }
	});
}

function addMemberView(id) {
    let memberElm = $('#member-me').clone();
    memberElm.attr('id', id);
    memberElm.find('div.member-id').html(id);
    memberElm.css('display', 'flex');
    memberElm.appendTo($('#member-list'));
}

function removeView(id) {
    // if ($('#' + id)[0]) {
    //     $('#' + id).remove();
    //     //将video-grid中第一个div设为main-video
    //     $('.video-box').first().css('grid-area', '1/1/3/4');
    // }
	if ($('#' + id)[0]) {
	    $('#' + id).remove();
	}
	var length = $('.video-box').length;
	var type = false;
	for(let i=0;i<length;i++){
		if($('.video-box').eq(i).hasClass('bigMoon')){
			type = true;
		}
	}
	if(type){
		for(let i=1;i<length;i++){
			$('.video-box').eq(i).css({
				'width': '200px',
				'height': '25%',
				'position': 'absolute',
				'right':'0',
				'backgroundColor': '#f0f0f0',
				'overflow': 'hidden',
				'zIndex': '9',
				'top':(i-1)*25+'%'
			})
		}
	}else{
		$('.video-box').eq(0).css({
			'width': '100%',
			'height': '100%',
			'position': 'absolute',
			'right':'0',
			'backgroundColor': 'black',
			'overflow': 'hidden',
			'zIndex': '8',
			'top':'0'
		})
		for(let i=1;i<length;i++){
			$('.video-box').eq(i).css({
				'width': '200px',
				'height': '25%',
				'position': 'absolute',
				'right':'0',
				'backgroundColor': '#f0f0f0',
				'overflow': 'hidden',
				'zIndex': '9',
				'top':(i-1)*25+'%'
			})
		}
	}
}

function exchangeView(a, b) {
    var $div1 = $(a);
    var $div3 = $(b);
    var $temobj1 = $("<div></div>");
    var $temobj2 = $("<div></div>");
    $temobj1.insertBefore($div1);
    $temobj2.insertBefore($div3);
    $div1.insertAfter($temobj2);
    $div3.insertAfter($temobj1);
    $temobj1.remove();
    $temobj2.remove();
}

function isPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = new Array('Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod');
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

function getCameraId() {
    console.log('selected cameraId: ' + cameraId);
    return cameraId;
}

function getMicrophoneId() {
    console.log('selected microphoneId: ' + micId);
    return micId;
}

function throttle(func, delay) {
    var timer = null;
    var startTime = Date.now();
    return function () {
        var curTime = Date.now();
        var remaining = delay - (curTime - startTime);
        var context = this;
        var args = arguments;
        clearTimeout(timer);
        if (remaining <= 0) {
            func.apply(context, args);
            startTime = Date.now();
        } else {
            timer = setTimeout(() => {
                console.log('duplicate click');
            }, remaining);
        }
    };
}

function resetView() {
    isCamOn = true;
    isMicOn = true;
    isScreenOn = false;
    isJoined = true;
    $('#main-video-btns').hide();
    $('#video-btn').attr('src', './TRTC/img/big-camera-on.png');
    $('#mic-btn').attr('src', './TRTC/img/big-mic-on.png');
    $('#screen-btn').attr('src', './TRTC/img/screen-off.png');
    $('#member-me').find('.member-video-btn').attr('src', 'img/camera-on.png');
    $('#member-me').find('.member-audio-btn').attr('src', 'img/mic-on.png');
    $('.mask').hide();
    //清空member-list
    if ($('#member-list')) {
        $('#member-list')
            .find('.member')
            .each((index, element) => {
                if ($(element).parent().attr('id') != 'member-me') {
                    $(element).parent().remove();
                }
            });
    }
}

function getBroswer(){
    var sys = {};
    var ua = navigator.userAgent.toLowerCase();
    var s;
    (s = ua.match(/edge\/([\d.]+)/)) ? sys.edge = s[1] :
    (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? sys.ie = s[1] :
    (s = ua.match(/msie ([\d.]+)/)) ? sys.ie = s[1] :
    (s = ua.match(/firefox\/([\d.]+)/)) ? sys.firefox = s[1] :
    (s = ua.match(/chrome\/([\d.]+)/)) ? sys.chrome = s[1] :
    (s = ua.match(/opera.([\d.]+)/)) ? sys.opera = s[1] :
    (s = ua.match(/version\/([\d.]+).*safari/)) ? sys.safari = s[1] : 0;

    if (sys.edge) return { broswer : "Edge", version : sys.edge };
    if (sys.ie) return { broswer : "IE", version : sys.ie };
    if (sys.firefox) return { broswer : "Firefox", version : sys.firefox };
    if (sys.chrome) return { broswer : "Chrome", version : sys.chrome };
    if (sys.opera) return { broswer : "Opera", version : sys.opera };
    if (sys.safari) return { broswer : "Safari", version : sys.safari };
    
    return { broswer : "", version : "0" };
}

function isHidden() {
    var hidden, visibilityChange; 
    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    return document[hidden];
}
