// メッセージ表示ウインドウコンストラクタ
MessageWindow = function() {

	// 表示位置
	this._x = 0;
	this._y = 0;

	// ウインドウの大きさ
	this._width = 0;
	this._height = 0;

	// 外枠サイズ
	this._border_size = MessageWindow.DEFAULT_BORDER_SIZE;

	// 枠内領域の左上座標
	this._inner_x = 0;
	this._inner_y = 0;

	// 枠内領域の大きさ
	this._inner_width = 0;
	this._inner_height = 0;

	// 枠内余白
	this._content_padding = MessageWindow.DEFAULT_CONTENT_PADDING;

	// 文字列表示領域左上座標
	this._content_x = 0;
	this._content_y = 0;

	// 文字列表示領域の大きさ
	this._content_width = 0;
	this._content_height = 0;

	// 1ページの表示行数
	this._page_lines = 0;

	// 文字列描画フォント
	this._font = MessageWindow.DEFAULT_FONT;

	// 一行の高さ
	this._line_height = MessageWindow.DEFAULT_LINE_HEIGHT;

	// 表示文字列（ページ配列）
	this._pageList = new Array();

	this._process_stage = 0;
	this._process_count = 0;

	// 現在ページ
	this._page_index = 0;

	// 現在表示位置
	this._putting_line = 0;
	this._putting_pos = 0;

	// 可視（描画）フラグ
	this._visible = false;

	// 描画時の横幅取得
	this.getWidth = function() {
		return this._width;
	}

	// 描画時の高さ取得
	this.getHeight = function() {
		return this._height;
	}

	// ウインドウの大きさを設定
	this.setSize = function(width, height) {

		if (width < ((this._border_size * 2) + (this._content_padding * 2)) || height < ((this._border_size * 2) + (this._content_padding * 2))) {
			return false;
		}

		// ウインドウ全体の大きさを保存
		this._width = width;
		this._height = height;

		// 枠内領域の大きさを計算
		this._inner_width = this._width - (this._border_size * 2);
		this._inner_height = this._height - (this._border_size * 2);

		// 文字列表領域の大きさを計算
		this._content_width = this._inner_width - (this._content_padding * 2);
		this._content_height = this._inner_height - (this._content_padding * 2);

		// 1ページあたりの行数を計算
		this._page_lines = Math.floor(this._content_height / this._line_height);

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

	// 表示文字列を設定
	this.setText = function(text, context) {

		// 表示文字列配列を初期化
		this._pageList = new Array();

		var line = '';
		var lineList = new Array();

		// 文字列処理位置
		var pos = 0;

		var page_flag;

		// フォント設定
		context.font = this._font;

		// ウインドウの横幅に合わせて各行のテキスト作成
		while (pos < text.length) {

			// 改ページフラグリセット
			page_flag = false;

			// 文字列の描画幅がウインドウ幅を超えるまで現在行に文字追加
			while (pos < text.length && context.measureText(line + text.charAt(pos)).width < this._content_width) {

				// 現在位置に<:br>タグがあれば改行し現在位置をタグの次の文字へ
				if (text.indexOf('<:br>', pos) == pos) {

					pos += 5;

					// 現在行の処理を終了する
					break;

				}

				// 現在位置に<:page>タグがあれば改ページ処理へ
				if (text.indexOf('<:page>', pos) == pos) {

					pos += 7;

					// 改ページフラグセット
					page_flag = true;

					// 現在行の処理を終了する
					break;

				}

				// 現在行に現在位置の文字を追加
				line = line + text.charAt(pos);

				// 現在位置更新
				pos++;

			}

			// 現在行の文字列を行配列に追加
			lineList.push(line);

			// 改ページフラグがセットされていたら改ページ文字を挿入
			if (page_flag) {
				lineList.push("\f");
			}

			// 現在行の文字列を初期化
			line = '';

		}

		// 逐次出力中の文字列位置
		var page_pos = 0;
		var line_pos = 0;

		var i;

		// 行配列をページ配列に格納
		while (line_pos < lineList.length) {

			// 新ページ作成
			this._pageList[page_pos] = new Array();

			// ページ配列の現在ページに行配列の各行を追加
			for (i = 0;(i < this._page_lines) && (line_pos < lineList.length);i++) {

				// 改ページ文字判定
				if (lineList[line_pos].charAt(0) == "\f") {

					// 現在行位置を改ページ文字行の次へ
					line_pos++;

					// ページ先頭でなければ改ページ処理実行
					if (i > 0) {

						// 現在ページを終了し新規ページへ
						break;

					}

				} else {

					// ページ配列の現在位置に行配列の文字列をコピー
					this._pageList[page_pos].push(lineList[line_pos++]);

				}

			}

			page_pos++;

		}

		// 処理状態を逐次出力に
		this._process_stage = MessageWindow.PROCESS_STAGE_PUTTING;

		// 現在ページ位置を最初のページに
		this._page_index = 0;

		// 現在表示位置初期化
		this._putting_line = 0;
		this._putting_pos = 0;

	}

	// 定時処理
	this.process = function(key) {

		switch (this._process_stage) {

		// ページ開始
		case MessageWindow.PROCESS_STAGE_PAGE_START:

			// リターンキー解放待機後にページ表示処理開始
			if (key.getTrigger() == 0) {

				this._putting_line = 0;
				this._putting_pos = 0;

				this._process_stage = MessageWindow.PROCESS_STAGE_PUTTING;

			}

			break;

		// ページ表示完了
		case MessageWindow.PROCESS_STAGE_PAGE_END:

			// リターンキー解放待機後にページ／メッセージ終了処理へ
			if (key.getTrigger() == 0) {
				if (this._page_index < this._pageList.length - 1) {
					this._process_stage = MessageWindow.PROCESS_STAGE_PAGE_EXIT;
				} else {
					this._process_stage = MessageWindow.PROCESS_STAGE_MESSAGE_EXIT;
				}
			}

			break;

		// ページ終了処理
		case MessageWindow.PROCESS_STAGE_PAGE_EXIT:

			// リターンキーが押されていたら、次ページ開始
			if (key.getTrigger() != 0) {

				this._page_index++;

				this._process_stage = MessageWindow.PROCESS_STAGE_PAGE_START;

			}

			break;

		// メッセージ（全ページ）終了処理
		case MessageWindow.PROCESS_STAGE_MESSAGE_EXIT:

			// リターンキーが押されていたら、終了状態へ
			if (key.getTrigger() != 0) {
				this._process_stage = MessageWindow.PROCESS_STAGE_EXIT;
			}

			break;

		// ページ文字列逐次出力中
		case MessageWindow.PROCESS_STAGE_PUTTING:

			// 表示位置更新
			this._putting_pos++;

			// 一行の表示終了
			if (this._putting_pos >= this._pageList[this._page_index][this._putting_line].length) {

				// ページ全行の表示完了ならページ終了
				if (this._putting_line == this._pageList[this._page_index].length - 1) {
					this._process_stage = MessageWindow.PROCESS_STAGE_PAGE_END;
				} else {

					// 次の行へ
					this._putting_line++;
					this._putting_pos = 0;

				}

			}

			// リターンキーが押されていたらページ全表示
			if (this._process_stage == MessageWindow.PROCESS_STAGE_PUTTING && key.getTrigger() != 0) {
				this._process_stage = MessageWindow.PROCESS_STAGE_PAGE_END;
			}

			break;

		}

		this._process_count++;

		// 表示終了状態ならtrue
		return this._process_stage == MessageWindow.PROCESS_STAGE_EXIT;

	}

	// メッセージ表示ダイアログ描画関数
	this.draw = function(context) {

		// 可視状態でなければ描画処理は行わない
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
		context.textBaseline = 'top';

		// フォント設定
		context.font = this._font;

		switch (this._process_stage) {

		// ページ文字列逐次出力中
		case MessageWindow.PROCESS_STAGE_PUTTING:

			// 現在行の前まで一気に出力
			for (i = 0;i < this._putting_line;i++) {
				context.fillText(this._pageList[this._page_index][i], this._content_x, this._content_y + i * this._line_height);
			}

			// 現在表示中の行の文字列を表示位置の文字まで描画
			context.fillText(this._pageList[this._page_index][this._putting_line].substring(0, this._putting_pos), this._content_x, this._content_y + i * this._line_height);

			break;

		// ページ全体表示中
		case MessageWindow.PROCESS_STAGE_PAGE_END:
		case MessageWindow.PROCESS_STAGE_PAGE_EXIT:
		case MessageWindow.PROCESS_STAGE_MESSAGE_EXIT:

			// 現在ページ内にある行配列の文字列を描画
			for (i = 0;i < this._pageList[this._page_index].length;i++) {
				context.fillText(this._pageList[this._page_index][i], this._content_x, this._content_y + i * this._line_height);
			}

			break;

		}

		// 文字列描画領域のX方向中心座標を算出
		var content_center_x = this._content_x + (this._content_width / 2);

		// 次ページ待機中なら、次ページマーカーを点滅表示
		if (this._process_stage == MessageWindow.PROCESS_STAGE_PAGE_EXIT && (this._process_count % 10) < 5) {

			context.beginPath();

			// ウインドウ下部に三角形のパスを設定
			context.moveTo(content_center_x - 6, this._content_y + this._content_height - 12);
			context.lineTo(content_center_x + 6, this._content_y + this._content_height - 12);
			context.lineTo(content_center_x, this._content_y + this._content_height);

			context.closePath();

			context.fillStyle = '#ffffff';

			// 設定したパスを塗りつぶす
			context.fill();

		}

	}

	this.setSize(MessageWindow.DEFAULT_WIDTH, MessageWindow.DEFAULT_HEIGHT);

	this.setPos(0, 0);

}

MessageWindow.DEFAULT_BORDER_SIZE = 1;
MessageWindow.DEFAULT_CONTENT_PADDING = 2;
MessageWindow.DEFAULT_WIDTH = 224;
MessageWindow.DEFAULT_HEIGHT = 160;

MessageWindow.DEFAULT_FONT = "14px monospace";
MessageWindow.DEFAULT_LINE_HEIGHT = 18;

MessageWindow.PROCESS_STAGE_NONE = 0;
MessageWindow.PROCESS_STAGE_PUTTING = 1;
MessageWindow.PROCESS_STAGE_PAGE_WAIT = 2;
MessageWindow.PROCESS_STAGE_PAGE_START = 3;
MessageWindow.PROCESS_STAGE_PAGE_END = 4;
MessageWindow.PROCESS_STAGE_PAGE_EXIT = 5;
MessageWindow.PROCESS_STAGE_MESSAGE_EXIT = 6;
MessageWindow.PROCESS_STAGE_EXIT = 7;
