// 選択ダイアログオブジェクト
SelectDialog = function() {

	// 表示位置
	this._x = 0;
	this._y = 0;

	// ウインドウの大きさ
	this._width = 0;
	this._height = 0;

	// 外枠サイズ
	this._border_size = SelectDialog.DEFAULT_BORDER_SIZE;

	// 枠内領域の左上座標
	this._inner_x = 0;
	this._inner_y = 0;

	// 枠内領域の大きさ
	this._inner_width = 0;
	this._inner_height = 0;

	// 枠内余白
	this._content_padding = SelectDialog.DEFAULT_CONTENT_PADDING;

	// 選択領域左上座標
	this._content_x = 0;
	this._content_y = 0;

	// 選択領域の大きさ
	this._content_width = 0;
	this._content_height = 0;

	// 文字列描画フォント
	this._font = SelectDialog.DEFAULT_FONT;

	// 一行の高さ
	this._item_height = SelectDialog.DEFAULT_ITEM_HEIGHT;

	// カーソルキー押下ウエイト
	this._key_wait = 0;

	// 現在の選択位置
	this._index = 0;

	// 可視（描画処理実行）フラグ
	this._visible = false;

	// 選択位置カーソルサイズ
	this._cursor_size = 12;

	// 現在の処理状態
	this._process_stage = SelectDialog.PROCESS_STAGE_NONE;

	// 選択肢
	this._itemList = new Array();

	// 描画時のX座標取得
	this.getX = function() {
		return this._x;
	}

	// 描画時のY座標取得
	this.getY = function() {
		return this._y;
	}

	// 描画時の横幅取得
	this.getWidth = function() {
		return this._width;
	}

	// 描画時の高さ取得
	this.getHeight = function() {
		return this._height;
	}

	// 表示位置設定
	this.setPos = function(x, y) {

		this._x = x;
		this._y = y;

		this._inner_x = x + this._border_size;
		this._inner_y = y + this._border_size;

		this._content_x = this._inner_x + this._content_padding;
		this._content_y = this._inner_y + this._content_padding;

	}

	// 可視状態に
	this.show = function() {
		this._visible = true;
	}

	// 不可視状態に
	this.hide = function() {
		this._visible = false;
	}

	// 現在のカーソル（選択）位置を取得
	this.getIndex = function() {
		return this._index;
	}

	// 選択肢を設定
	this.setItems = function(items, context) {

		var i;

		this._itemList = new Array();

		var maxWidth = 0;

		// フォント設定
		context.font = this._font;

		// 選択肢文字列中の最大描画幅を取得
		for (i = 0;i < items.length;i++) {

			this._itemList.push(items[i]);

			if (context.measureText(items[i]).width > maxWidth) {
				maxWidth = context.measureText(items[i]).width;
			}

		}

		// ウインドウの大きさを設定
		this._width = maxWidth + this._cursor_size + (this._content_padding * 2)+ (this._border_size * 2);
		this._height = items.length * this._item_height + (this._content_padding * 2) + (this._border_size * 2);

		// 枠内領域の大きさを計算
		this._inner_width = this._width - (this._border_size * 2);
		this._inner_height = this._height - (this._border_size * 2);

		// 選択肢領域の大きさを計算
		this._content_width = this._inner_width - (this._content_padding * 2);
		this._content_height = this._inner_height - (this._content_padding * 2);

		// 状態を初期化
		this._key_wait = 0;
		this._index = 0;
		this._process_stage = SelectDialog.PROCESS_STAGE_NONE;

	}

	// 選択状態を初期化
	this.reset = function() {

		// 状態を初期化
		this._key_wait = 0;
		this._index = 0;

		this._process_stage = SelectDialog.PROCESS_STAGE_NONE;

	}

	// 渡されたキー状態に応じてダイアログ状態を更新
	this.process = function(key) {

		// キーウエイトが0でなければウエイト処理
		if (this._key_wait > 0) {

			// 方向キー解放状態なら無条件にウエイト終了
			if (key.getStick() == KeyStatusHolder.KEYFLAG_NONE) {
				this._key_wait = 0;
			} else {
				this._key_wait--;
			}

		}

		switch (this._process_stage) {

		// 初期状態
		case SelectDialog.PROCESS_STAGE_NONE:

			// リターンキー解放を待って選択状態へ
			if (key.getTrigger() == 0) {
				this._process_stage = SelectDialog.PROCESS_STAGE_SELECT;
			}

			break;

		// 選択状態
		case SelectDialog.PROCESS_STAGE_SELECT:

			// リターンキーが押されたら選択実行
			if (key.getTrigger() != 0) {
				this._process_stage = SelectDialog.PROCESS_STAGE_DONE;
			}

			// ウエイト中でなければ、上下キー入力処理
			if (this._key_wait == 0) {

				// 上キー処理
				if (key.getStick() == KeyStatusHolder.KEYFLAG_UP && this._index > 0) {

					// 現在位置を一つ上へ
					this._index--;

					// ウエイト開始
					this._key_wait = 10;

				}

				// 下キー
				if (key.getStick() == KeyStatusHolder.KEYFLAG_DOWN && this._index < this._itemList.length -1) {

					// 現在位置を一つ下へ
					this._index++;

					// ウエイト開始
					this._key_wait = 10;

				}

			}

			break;

		// 選択済み状態
		case SelectDialog.PROCESS_STAGE_DONE:

			// 選択済みでリターンキーが解放されたら終了状態としてtrueを返す
			if (key.getTrigger() == 0) {

				return true;

			}

			break;

		}

		return false;

	}

	this.draw = function(context) {

		if (!this._visible) {
			return;
		}

		var i;

		// ウインドウ領域全体を白でクリア
		context.fillStyle = '#ffffff';
		context.fillRect(this._x, this._y, this._width, this._height);

		// 内側を黒でクリア
		context.fillStyle = '#000000';
		context.fillRect(this._inner_x, this._inner_y, this._inner_width, this._inner_height);

		// テキスト描画設定
		context.fillStyle = '#ffffff';
		context.textBaseline = 'middle';

		// フォント設定
		context.font = this._font;

		// 選択肢文字列を描画
		for (i = 0;i < this._itemList.length;i++) {
			context.fillText(this._itemList[i], this._content_x + this._cursor_size, Math.floor(this._item_height / 2) + this._content_y + i * this._item_height);
		}

		context.fillStyle = '#ffffff';

		context.beginPath();

		// 現在の選択インデックスの位置に三角形のパスを設定
		context.moveTo(this._content_x + 1, this._content_y + this._index * this._item_height + 2);
		context.lineTo(this._content_x + this._cursor_size - 2, this._index * this._item_height + this._content_y + Math.floor(this._item_height / 2));
		context.lineTo(this._content_x + 1, this._content_y + (this._index + 1) * this._item_height - 2);

		context.closePath();

		// 設定したパスを塗りつぶしカーソルを描画
		context.fill();

	}

}

SelectDialog.PROCESS_STAGE_NONE = 0;
SelectDialog.PROCESS_STAGE_SELECT = 1;
SelectDialog.PROCESS_STAGE_DONE = 2;

SelectDialog.DEFAULT_BORDER_SIZE = 1;
SelectDialog.DEFAULT_CONTENT_PADDING = 2;

SelectDialog.DEFAULT_FONT = "14px monospace";
SelectDialog.DEFAULT_ITEM_HEIGHT = 18;
