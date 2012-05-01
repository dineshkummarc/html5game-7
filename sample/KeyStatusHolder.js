// キー状態管理オブジェクトコンストラクタ
KeyStatusHolder = function() {

	this._key_flag = KeyStatusHolder.KEYFLAG_NONE;

	// キー状態取得
	this.getKeyFlag = function() {
		return this._key_flag;
	}

	// トリガー（リターンキー）取得 {
	this.getTrigger = function() {
		return this._key_flag & KeyStatusHolder.KEYMASK_TRIGGER;
	}

	// 方向キー（単一）取得
	this.getStick = function() {

		// 現在の方向キー状態を取得
		var stick_flag = this._key_flag & KeyStatusHolder.KEYMASK_STICK;

		// 方向キーが単独で押下状態ならそのコードを返す
		if (stick_flag == KeyStatusHolder.KEYFLAG_UP || stick_flag == KeyStatusHolder.KEYFLAG_DOWN || stick_flag == KeyStatusHolder.KEYFLAG_LEFT || stick_flag == KeyStatusHolder.KEYFLAG_RIGHT) {
			return stick_flag;
		}

		return KeyStatusHolder.KEYFLAG_NONE;

	}

	// キー押下時の処理
	this.OnKeyDown = function(e) {

		var code = e.keyCode;

		// キー押下状態に応じてキーフラグ設定
		switch (code) {

		// リターンキー
		case 13:

			e.preventDefault();

			this._key_flag |= KeyStatusHolder.KEYFLAG_SELECT;

			break;

		// 上キー
		case 38:

			e.preventDefault();

			this._key_flag |= KeyStatusHolder.KEYFLAG_UP;

			break;

		// 下キー
		case 40:

			e.preventDefault();

			this._key_flag |= KeyStatusHolder.KEYFLAG_DOWN;

			break;

		// 左キー
		case 37:

			e.preventDefault();

			this._key_flag |= KeyStatusHolder.KEYFLAG_LEFT;

			break;

		// 右キー
		case 39:

			e.preventDefault();

			this._key_flag |= KeyStatusHolder.KEYFLAG_RIGHT;

			break;

		}

	}

	// キー解放時の処理
	this.OnKeyUp = function(e) {

		var code = 0;

		code = e.keyCode;

		// キー押下状態に応じてキーフラグ設定
		switch (code) {

		// リターンキー
		case 13:

			e.preventDefault();

			this._key_flag &= ~KeyStatusHolder.KEYFLAG_SELECT;

			break;

		// 上キー
		case 38:

			e.preventDefault();

			this._key_flag &= ~KeyStatusHolder.KEYFLAG_UP;

			break;

		// 下キー
		case 40:

			e.preventDefault();

			this._key_flag &= ~KeyStatusHolder.KEYFLAG_DOWN;

			break;

		// 左キー
		case 37:

			e.preventDefault();

			this._key_flag &= ~KeyStatusHolder.KEYFLAG_LEFT;

			break;

		// 右キー
		case 39:

			e.preventDefault();

			this._key_flag &= ~KeyStatusHolder.KEYFLAG_RIGHT;

			break;

		}

	}

}

// キー押下フラグ
KeyStatusHolder.KEYFLAG_NONE = 0;
KeyStatusHolder.KEYFLAG_SELECT = 1;
KeyStatusHolder.KEYFLAG_UP = 2;
KeyStatusHolder.KEYFLAG_DOWN = 4;
KeyStatusHolder.KEYFLAG_LEFT = 8;
KeyStatusHolder.KEYFLAG_RIGHT = 16;

// キー状態マスク
KeyStatusHolder.KEYMASK_TRIGGER = 1;
KeyStatusHolder.KEYMASK_STICK = 30;
