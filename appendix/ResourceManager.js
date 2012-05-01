// リソースマネージャー関連

// ロードデータオブジェクトコンストラクタ
var LoadingItem = function() {

	this.status = LoadingItem.LOADINGSTATE_NONE;

	this.item = null;
	this.path = null;

	this.onLoad = null;

	this.type = LoadingItem.ITEMTYPE_NONE;

}

// 画像ファイル読み込み
LoadingItem.prototype.loadImage = function(path, callBack) {

	this.item = new Image();

	this.status = LoadingItem.LOADINGSTATE_LOADING;

	this.onLoad = callBack;

	// 読み込み完了時のイベントハンドラ設定
	this.item.onload = function() {
		LoadingItem.manager.onImageLoad(path, LoadingItem.LOADINGSTATE_DONE);
	}

	// 読み込み失敗時のイベントハンドラ設定
	this.item.onerror = function() {
		LoadingItem.manager.onImageLoad(path, LoadingItem.LOADINGSTATE_ERROR);
	}

	this.path = path;
	this.item.src = path;

}

// テキストファイル読み込み
LoadingItem.prototype.loadText = function(path, callBack) {

	// 読み込み処理用XMLHttpRequestを作成し読み込みオブジェクトに保存
	if (navigator.userAgent.indexOf("MSIE") > 0 && location.protocol.indexOf("file") == 0) {
		this.item = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		this.item = new XMLHttpRequest();
	}

	this.status = LoadingItem.LOADINGSTATE_LOADING;

	this.onLoad = callBack;
	this.path = path;

	// 読み込み状態追跡用イベントハンドラ設定
	this.item.onreadystatechange = function() {
		LoadingItem.manager.onTextLoad(path);
	}

	this.item.open("get", path, true);
	this.item.send(null);

}

// 読み込みが完了したか問い合わせ
LoadingItem.prototype.isLoaded = function() {
	return this.status == LoadingItem.LOADINGSTATE_DONE;
}

LoadingItem.manager = null;

LoadingItem.LOADINGSTATE_NONE = 0;
LoadingItem.LOADINGSTATE_LOADING = 1;
LoadingItem.LOADINGSTATE_DONE = 2;
LoadingItem.LOADINGSTATE_ERROR = 3;

LoadingItem.ITEMTYPE_NONE = 0;
LoadingItem.ITEMTYPE_IMAGE = 1;

// データ読み込み管理オブジェクトコンストラクタ
var ResourceManager = function() {

	// データのルートディレクトリ初期化
	this.home = '';

	// 読み込み対象のロードデータオブジェクト保持配列を作成
	this.loadingItemList = new Array();

	// ロードデータオブジェクト全体に管理オブジェクトを通知
	LoadingItem.manager = this;

	// データのルートディレクトリ設定
	this.setResourceHome = function(path) {
		this.home = path;
	}

	this.getItem = function(name) {
		return this.loadingItemList[name];
	}

	// 指定画像ファイルを読み込む
	this.loadImage = function(name, callBack) {

		this.loadingItemList[name] = new LoadingItem();

		this.loadingItemList[name].loadImage(this.home + name, callBack);

	}

	// 指定テキストファイルを読み込む
	this.loadText = function(name, callBack) {

		this.loadingItemList[name] = new LoadingItem();

		this.loadingItemList[name].loadText(this.home + name, callBack);

	}

	// 画像ファイル読み込み処理イベントハンドラ
	this.onImageLoad = function(name, result) {

		var item = this.loadingItemList[name];

		if (item) {

			item.status = result;

			// 読み込み完了時のイベントハンドラが設定されていれば呼び出す
			if (item.onLoad) {
				item.onLoad(item);
			}

		}

	}

	// テキストファイル読み込み処理イベントハンドラ
	this.onTextLoad = function(path) {

		var text;
		var item = this.loadingItemList[path];

		if (item) {

			// 読み込み完了ならロードデータオブジェクトに結果を設定
			if (item.item.readyState == 4) {

				if (item.item.status <= 200) {

					// 読み込んだデータを取得
					text = new String(item.item.responseText);

					delete item.item;

					item.item = text;
					item.status = LoadingItem.LOADINGSTATE_DONE;

				} else {

					delete item.item;

					item.status = LoadingItem.LOADINGSTATE_ERROR;

				}

				// 読み込み完了時のイベントハンドラが設定されていれば呼び出す
				if (item.onLoad) {
					item.onLoad(item);
				}

			}

		}

	}

	// 指定リソースが読み込まれたか問い合わせ
	this.isLoaded = function(name) {

		if (!this.loadingItemList[name]) {
			return false;
		}

		return this.loadingItemList[name].isLoaded();

	}

}
