var config = {
	configDatas:{
		"serverUrl":"127.0.0.1",
		"Wrapper":{
			"region": "oss-cn-szfinance",
			"accessKeyId": "",
			"accessKeySecret": "",
			"bucket": "p154oss",
			"stsToken":""
		}
	}
}

/**生产环境**/

//是否是H5自测模式
var isH5Test = true;
//系统H5版本号
var isH5Version = '1.00.00';
$(document).ready(function() {
});

function guid() {
	return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

function GetQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) return decodeURI(r[2]);
	return null;
}

//加入房间接口调用
function getEnterRoom(username,roomNo) {
	var para={
			"username":username,
//					"password":"12345",
			"roomNo":roomNo
		}
	var onSuccess = function(data){
		if(data.resCode == "0000"){
			sessionStorage.setItem("userId",username);
			sessionStorage.setItem("roomId",roomNo);
			window.location.href = "index.html";
		}
	}
	var ajax = new MYAJAX("enterRoom", "h5", para, onSuccess);
}

var Record = (function() {
	var __scanCode = function(onSuccess) {
		var para = {
			"flag": "0"
		};

		CDVOriginalPort("goToQRCode", para, onSuccess, function(e) {
			var msg = message[e];
			if(!msg) {
				msg = "拍照失败";
			}
			//alert(msg);
		});
	}

	var __scanCodeOCR = function(onSuccess) {
		var para = {
			"flag": "0"
		};

		CDVOriginalPort("goToOcr", para, onSuccess, function(e) {
			var msg = message[e];
			if(!msg) {
				msg = "获取身份证信息失败";
			}
			//alert(msg);
		});
	}

	var __takePhoto = function(taskID, attachID, ApplicationNo, PolicyHolder, InsuredPersonAge, applicantId, onSuccess) {
		var para = {
			"taskId": taskID,
			"attachId": attachID,
			"applicationNo": ApplicationNo,
			"policyHolder": PolicyHolder,
			"insuredPersonAge": InsuredPersonAge,
			"applicantId": applicantId

		};

		CDVOriginalPort("takePhoto", para, onSuccess, function(e) {
			var msg = message[e];
			if(!msg) {
				msg = "拍照失败";
			}
			//alert(msg);
		});
	}

	var __soundRecord = function(taskID, attachID, ApplicationNo, PolicyHolder, InsuredPersonAge, applicantId, onSuccess) {
		var para = {
			"taskId": taskID,
			"attachId": attachID,
			"applicationNo": ApplicationNo,
			"policyHolder": PolicyHolder,
			"insuredPersonAge": InsuredPersonAge,
			"applicantId": applicantId
		};
		CDVOriginalPort("soundRecording", para, onSuccess, function(e) {
			if(!e) {
				e = "录音失败";
			}
			//alert(e);
		});
	}
	var __takeVideo = function(taskID, attachID, ApplicationNo, PolicyHolder, InsuredPersonAge, applicantId, personNum,isBuLu, onSuccess) {
		var para = {
			"taskId": taskID,
			"attachId": attachID,
			"applicationNo": ApplicationNo,
			"policyHolder": PolicyHolder,
			"insuredPersonAge": InsuredPersonAge,
			"applicantId": applicantId,
			"personNum": personNum,
			"isBuLu": isBuLu
		};
		if(!isH5Test) {
			CDVOriginalPort("takeVideo", para, onSuccess, function(e) {
				if(!e) {
					e = "视频录制失败";
				}
			});
		}
	}

	var __queryMobileDb = function(taskID, attachID, onSuccess) {
		var para = {
			"taskId": taskID,
			"attachId": attachID
		};
		if(isH5Test) {
			//TODO 获取本地的视频
			onSuccess(attachID, "img/video.png");
		} else {
			CDVOriginalPort("queryDbTable", para, onSuccess, function(e) {
				if(!e) {
					e = "查询移动端数据库数据失败";
				}
				//alert(e);
			});
		}

	}
	var __upload = function(taskID, applicationNo, policyHolder, insuredPersonAge, applicantId, onSuccess) {

		var para = {
			"taskId": taskID,
			"applicationNo": applicationNo,
			"policyHolder": policyHolder,
			"insuredPersonAge": insuredPersonAge,
			"applicantId": applicantId
		};
		CDVOriginalPort("upload", para, onSuccess, function(e) {
			if(!e) {
				e = "上传文件失败！";
			}
			//alert(e);
		});
	}

	return {
		takePhoto: __takePhoto,
		takeVideo: __takeVideo,
		soundRecord: __soundRecord,
		scanCode: __scanCode,
		queryMobileDb: __queryMobileDb,
		upload: __upload,
		scanCodeOCR: __scanCodeOCR,

	};
})();

/**
 * 打开二级页面
 * OpenWebview.openOfflineWithTitle(title, url)通过Webview打开离线H5页面(标题,H5页面地址)
 */
var OpenWebview = (function() {
	var __openOfflineWithTitle = function(title, url) {
		var para = {
			"title": title,
			"url": url,
			"urlType": "01",
			"openCode": "2",
			"moduleCode": "",
			"menuArray": []
		};
		if(isH5Test) {
			window.location.href = "../" + url;
		} else {
			CDVOriginalPort("goToH5", para, function(e) {}, function(e) {});
		}

	}
	return {
		openOfflineWithTitle: __openOfflineWithTitle
	};
})();

/**
 * Utils.getData(name,onSuccess) 存储数据
 * Utils.saveData(name, value, onSuccess)获取数据
 * Utils.setMenu(title, menu)设置页面菜单(标题，菜单列表)
 * Utils.clearCache(onSuccess)清除缓存(成功回调函数)
 * Utils.setSystemPara(name, value, onSuccess) 设置系统参数(名称、值，成功后回调函数)
 * Utils.quitLogin(success) 退出登陆(成功回调函数)
 */
var Utils = (function() {
	var __setSystemPara = function(name, value, onSuccess) {
		var success = null;
		if(!onSuccess) {
			success = function(e) {}();
		} else {
			success = onSuccess;
		}

		function onError(Data) {
			console.log(Data);
			//alert("onError");
			if(!Data) {
				//alert("获取参数失败");
			} else {
				//alert(Data)
			}
		}
		if(isH5Test) {
			var str = sessionStorage.setItem(name, value);
		} else {
			var dataPass = {
				"name": name,
				"value": value
			}
			CDVOriginalPort("setSystemPara", dataPass, success, onError);
		}
	}
	var __showInput = function(name, onSuccess) {
		var dataPass = {
			"name": name
		};
		var success = null;
		if(!onSuccess) {
			success = function(e) {}();
		} else {
			success = onSuccess;
		}
		if(!isH5Test) {
			CDVOriginalPort("showInput", dataPass, success, onError);
		}

		function onError(Data) {
			if(!Data) {
				//           alert("获取参数失败");
			} else {
				//                alert(Data)
			}
		}
	}

	var __backToLogin = function(name, onSuccess) {
		var dataPass = {
			"name": name
		};
		var success = null;
		if(!onSuccess) {
			success = function(e) {}();
		} else {
			success = onSuccess;
		}
		CDVOriginalPort("backToLogin", dataPass, success, onError);

		function onError(Data) {
			if(!Data) {
				//           alert("获取参数失败");
			} else {
				//                alert(Data)
			}
		}
	}

	var __getData = function(name, onSuccess) {
		if(isH5Test) {
			var obj = {};
			if(name == "SYSTEM_INFO") {
				obj = {
					"version": isH5Version,
					"device_id": "h5",
					"uuid": "h5_test",
					"device_type": "H5"
				}
			} else if(name == "goToGetRoot") {
				obj = {
					"freeSize": 4797,
					"speed": 0,
					"battery": 0.86,
					"audio": true,
					"camera": true
				}
			} else if(name == "goToIsDailimPersonActivity") {
				obj = {
					"flag": 1
				}

			} else if(name == "goToIsToubaoPersonActivity") {
				obj = {
					"flag": true
				}
			} else if(name == "goToIsBeitoubaoPersonActivity") {
				obj = {
					"flag": true
				}
			} else if(name == "userInfo") {
				obj = {
					"userCode": "P0088",
					"userName": "王蒙"
				}
			}else if(name == "intentToQuality") {
				obj = {
					"taskId": "2020030610314510423451",
					"samplingType": "1"
				}
			}else if(name == "taskId") {
				obj = {
					"taskIdNext": "2020030610314510423451"
				}
			} else {
				var str = sessionStorage.getItem(name);
				obj = JSON.parse(str)
			}
			onSuccess(obj);
		} else {
			var dataPass = {
				"name": name
			};
			var success = null;
			if(!onSuccess) {
				success = function(e) {}();
			} else {
				success = onSuccess;
			}
			CDVOriginalPort("getH5Data", dataPass, success, onError);

			function onError(Data) {
				loadHide();
				if(!Data) {
//					mui.alert("获取参数失败");
				} else {
					mui.alert(Data)
				}
			}
		}
	}
	var __saveData = function(name, value, onSuccess) {
			var success = null;
			if(!onSuccess) {
				success = function(e) {}();
			} else {
				success = onSuccess;
			}

			if(isH5Test) {
				var str = JSON.stringify(value);
				sessionStorage.setItem(name, str);
			} else {
				var dataPass = {
					"name": name,
					"values": value
				}
				CDVOriginalPort("saveH5Data", dataPass, success, onError);

				function onError(Data) {
					if(!Data) {
						//					alert("获取参数失败");
					} else {
						//					alert(Data)
					}
				}
			}
		}
		/**
		 * 设置页面菜单
		 * var menuArray = new Array();
		 *var menu1 = {
		 *	"title": "任务详情",
		 *	"iconUrl": "pactera_other/img/search.png",
		 *	"function": "saveItem",
		 *	"params": {
		 *		"message": "啦啦啦2"
		 *	}
		 *};
		 * menuArray.push(menu1);
		 * 
		 * @param {String} title 菜单名称
		 * @param {Array} menu 菜单内容
		 */
	var __setMenu = function(title, menu) {

			var menuArray = menu;
			if(!menu) {
				menuArray = new Array();
			}
			var requestJson = {
				"title": title,
				"menuArray": menuArray
			};
			if(!isH5Test) {
				CDVOriginalPort("setMenu", requestJson, success, onError);
			}
			var success = function(e) {};

			function onError(Data) {
				if(!Data) {
					//					alert("设置菜单失败");
				} else {
					//					alert(Data)
				}
			}
		}
		/**
		 * 清除应用缓存  
		 * @param {Object} success 成功的回调方法
		 */
	var __clearCache = function(success) {
			CDVOriginalPort("clearCacheData", "{}", success, onError);

			function onError(Data) {
				if(!Data) {
					alert("清除缓存失败");
				} else {
					//					alert(Data)
				}
			}
		}
		/**
		 * 退出登陆
		 * @param {Object} success
		 */
	var __quitLogin = function(success) {
		CDVOriginalPort("exit_login", "{}", success, onError);

		function onError(Data) {
			//			alert('onError');
			if(!Data) {
				alert("清除缓存失败");
			} else {
				//				alert(JSON.stringify(Data));
			}
		}
	}
	return {
		getData: __getData,
		saveData: __saveData,
		setMenu: __setMenu,
		clearCache: __clearCache,
		quitLogin: __quitLogin,
		setSystemPara: __setSystemPara,
		showInput: __showInput,
		backToLogin: __backToLogin,
	};
})();

function initData(f) {
	var r = function() {
		setTimeout(f, 500)
	}
	if(isH5Test) {
		window.onload = r;
	} else {
		document.addEventListener("deviceready", r, false);
	}
}
var myajaxTRTC = function(serviceName, para, onSuccess, onError) {
	
	var url = '127.0.0.1';//config.configDatas.suntrtcUrl;
	function getDevice(){
	    let agent = navigator.userAgent.toLowerCase();
	    console.log(agent);
	    let result = {
	      device: function () {
	        if (/windows/.test(agent)) {
	          return 'windows pc';
	        } else if (/iphone|ipod/.test(agent) && /mobile/.test(agent)) {
	          return 'iphone';
	        } else if (/ipad/.test(agent) && /mobile/.test(agent)) {
	          return 'ipad';
	        } else if (/android/.test(agent) && /mobile/.test(agent)) {
	          return 'android';
	        } else if (/linux/.test(agent)) {
	          return 'linux pc';
	        } else if (/mac/.test(agent)) {
	          return 'mac';
	        } else {
	          return 'other';
	        }
	      }(),
	    };
	    deviceType = result.device;
	    return result;
	 };
	getDevice();
	
	var __data = {
		requestSource: "PC",
		deviceType: deviceType,
		deviceModel: "PC",
		systemVersion: "windows",
		serviceName: serviceName,
        servicePara:para
		
		// "requestSource":"miniProgram",
		// "deviceType":deviceType,//设备类型
		// "deviceModel":"",//设备/软件型号
		// "systemVersion":"",//系统版本号
		// "serviceName": serviceName,
		// "servicePara": para,
	};
	if(serviceName == 'aliYunToken'){
		url = "127.0.0.1"
		__data = {
			caseNo:'11'
		}
	}
	// ajaxParams.data =JSON.stringify(__data);
	console.log('%c入参', 'color:#ff881c', __data);
	try {
		$.ajaxSetup({
			type: "post",
			contentType: "application/json",
			dataType: 'json',
			url: url,
			data: JSON.stringify(__data),
			crossDomain: true,
			xhrFields: {
				withCredentials: true
			},
			success: function(response) {
	
				if(response) {
					console.log('%c回参', 'color:#ff881c', response);
				} else {
					console.log('%c回参', 'color:#ff881c', '--->' + response + '<---');
				}
	
				if(onSuccess) {
					onSuccess(response)
				}
	
			}
		});
		$.post();
	} catch(e) {
		// goToIndex();
	}
}

/**

 */
var MYAJAX = function(serviceName, bizId, para, onSuccess, onError) {
	
	loadShow();
	function loadHide() {
		$("#loading").fadeOut("slow");
	}

	function loadShow() {
		$("#loading").fadeIn("slow");
	}

	var ajaxParams = {

		type: "post",
		url: url,
		dataType: 'jsonp',
		jsonp: "jsoncallback",
		jsonpCallback: "successCallback",
		success: function(data) {}
	};

	if(!onError) {
		ajaxParams.error = function(data) {

		}
	} else {
		ajaxParams.error = onError;
	}
	if(!onSuccess) {
		ajaxParams.success = function() {
			loadHide();
			mui.alert("回调的成功方法为空");
		}
	} else {
		ajaxParams.success = onSuccess;
	}

	function dealTimeOut(e) {
		//自定义处理错误的回调方法
		loadHide();
		if(!e) {
			mui.alert('网络请求超时');
		} else {
			//mui.alert(JSON.stringify(e));
		}
		return;
	}

	ajaxParams.statusCode = {
		404: dealTimeOut,
		403: dealTimeOut,
		408: dealTimeOut
	}
	var fn_success = ajaxParams.success;
	ajaxParams.success = function(data, textstate) {
		//自定义处理错误的回调方法
		loadHide();
		if("timeout" == textstate) {
			mui.alert("网络请求超时，请稍后重试");
			return;
		}

		if(fn_success) {
			fn_success(data);
		}
	}

	var fn_error = ajaxParams.error;
	ajaxParams.error = function(data, textstate) {
		//自定义处理错误的回调方法
		loadHide();
		if("timeout" == textstate) {
			mui.alert("网络请求超时，请稍后重试");
			return;
		}

		if(fn_error) {
			fn_error(data);
		} else {
			mui.alert(data + ":" + textstate);
		}
	}

	if(!ajaxParams.data) {
		var deviceType = "";
		//获取设备类型
		function getDevice(){
		    let agent = navigator.userAgent.toLowerCase();
		    console.log(agent);
		    let result = {
		      device: function () {
		        if (/windows/.test(agent)) {
		          return 'windows pc';
		        } else if (/iphone|ipod/.test(agent) && /mobile/.test(agent)) {
		          return 'iphone';
		        } else if (/ipad/.test(agent) && /mobile/.test(agent)) {
		          return 'ipad';
		        } else if (/android/.test(agent) && /mobile/.test(agent)) {
		          return 'android';
		        } else if (/linux/.test(agent)) {
		          return 'linux pc';
		        } else if (/mac/.test(agent)) {
		          return 'mac';
		        } else {
		          return 'other';
		        }
		      }(),
		    };
		    console.log(result.device);
		    deviceType = result.device;
		    return result;
		 };
		getDevice();
		
		var __data = {
			"requestSource":"h5",
			"deviceType":deviceType,//设备类型
			"deviceModel":"",//设备/软件型号
			"systemVersion":"",//系统版本号
			"serviceName": serviceName,
			"servicePara": para,
		};
		if(serviceName == "addRecordingAction") {
			ajaxParams.data = 'para=' + JSON.stringify(__data);
		} else {
			ajaxParams.data = 'driver=h5&para=' + encodeURIComponent(JSON.stringify(__data), "UTF-8"), "picclife", "", "";
		}
		ajaxParams.beforeSend = function(xhr) {
			xhr.setRequestHeader('X-Requested-With', {
				toString: function() {
					return 'XMLHttpRequest';
				}
			});
		};
		console.log(ajaxParams);
		try {
			$.ajax(ajaxParams);
		} catch(e) {
			//alert(e)
		}
	}

}
//封装获取当前时间方法
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes()
            + seperator2 + date.getSeconds();
    return currentdate;
}