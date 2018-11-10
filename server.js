/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 150);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("prop-types");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("styled-components");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/object/get-prototype-of");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/classCallCheck");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/createClass");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/inherits");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/possibleConstructorReturn");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("lodash");

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ButtonContainer = exports.Button = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _reactFontawesome = __webpack_require__(39);

var _reactFontawesome2 = _interopRequireDefault(_reactFontawesome);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Button = exports.Button = function Button(props) {
  var borderless = props.borderless,
      children = props.children,
      color = props.color,
      icon = props.icon,
      onClick = props.onClick,
      text = props.text;

  var child = text || children;

  return _react2.default.createElement(
    ButtonContainer,
    {
      borderless: borderless,
      color: color,
      onClick: onClick,
      icon: icon
    },
    icon && _react2.default.createElement(_reactFontawesome2.default, { name: icon }),
    child && _react2.default.createElement(
      ButtonText,
      { icon: icon },
      child
    ),
    text && children && children
  );
};

var ButtonContainer = exports.ButtonContainer = _styledComponents2.default.button.withConfig({
  displayName: 'button__ButtonContainer',
  componentId: 'y3kcv0-0'
})(['font-size:.85em;border:1px solid;background:white;padding:6px 12px;color:inherit;cursor:pointer;position:relative;border-radius:0;transition:color 0.25s;color:', ';border-width:', ';'], function (props) {
  return props.color || 'black';
}, function (props) {
  return props.borderless ? '0' : '1px';
});

var ButtonText = _styledComponents2.default.span.withConfig({
  displayName: 'button__ButtonText',
  componentId: 'y3kcv0-1'
})(['', ''], function (props) {
  return props.icon && '\n    margin-left: 8px;\n  ';
});

Button.propTypes = {
  borderless: _propTypes2.default.bool,
  children: _propTypes2.default.any,
  color: _propTypes2.default.string,
  icon: _propTypes2.default.string,
  onClick: _propTypes2.default.func,
  text: _propTypes2.default.string
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.H6 = exports.H5 = exports.H4 = exports.H3 = exports.H2 = exports.H1 = exports.P = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var P = exports.P = _styledComponents2.default.div.withConfig({
  displayName: 'text__P',
  componentId: 'obput7-0'
})(['p,.public-DraftStyleDefault-block,.public-DraftEditorPlaceholder-root{padding:.75em 0;margin:0;line-height:1.4em;}p:first-child{padding-top:0;}']);

var H1 = exports.H1 = _styledComponents2.default.h1.withConfig({
  displayName: 'text__H1',
  componentId: 'obput7-1'
})(['font-size:2em;margin-top:0.35em;margin-bottom:0.35em;font-weight:400;line-height:1.2em;']);

var H2 = exports.H2 = _styledComponents2.default.h2.withConfig({
  displayName: 'text__H2',
  componentId: 'obput7-2'
})(['font-size:1.5em;margin-top:0.83em;margin-bottom:0.83em;font-weight:400;line-height:1.2em;']);

var H3 = exports.H3 = _styledComponents2.default.h3.withConfig({
  displayName: 'text__H3',
  componentId: 'obput7-3'
})(['font-size:1.17em;margin-top:1em;margin-bottom:1em;font-weight:400;line-height:1.2em;']);

var H4 = exports.H4 = _styledComponents2.default.h4.withConfig({
  displayName: 'text__H4',
  componentId: 'obput7-4'
})(['margin:0;font-weight:400;line-height:1.2em;']);

var H5 = exports.H5 = _styledComponents2.default.h5.withConfig({
  displayName: 'text__H5',
  componentId: 'obput7-5'
})(['font-size:0.83em;margin-top:0.5em;margin-bottom:0.5em;font-weight:400;line-height:1.2em;']);

var H6 = exports.H6 = _styledComponents2.default.h6.withConfig({
  displayName: 'text__H6',
  componentId: 'obput7-6'
})(['font-size:0.83em;margin-top:0.67em;margin-bottom:0.67em;line-height:1.2em;font-weight:400;text-transform:uppercase;letter-spacing:.045em;']);

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/object/assign");

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var asyncActionType = function asyncActionType(type) {
  return {
    PENDING: type + '_PENDING',
    SUCCESS: type + '_SUCCESS',
    ERROR: type + '_ERROR'
  };
};

var API = exports.API = 'API';

// item
var CHANGE_ITEM = exports.CHANGE_ITEM = 'CHANGE_ITEM';
var FETCH_ITEM = exports.FETCH_ITEM = asyncActionType('FETCH_ITEM');
var MAYBE_SAVE_ITEM = exports.MAYBE_SAVE_ITEM = 'MAYBE_SAVE_ITEM';
var UPDATE_ITEM = exports.UPDATE_ITEM = asyncActionType('UPDATE_ITEM');
var DELETE_ITEM = exports.DELETE_ITEM = asyncActionType('DELETE_ITEM');
var RESET_ITEM = exports.RESET_ITEM = 'RESET_ITEM';

// // items
var CREATE_ITEM = exports.CREATE_ITEM = asyncActionType('CREATE_ITEM');

// settings
var FETCH_SETTINGS = exports.FETCH_SETTINGS = asyncActionType('FETCH_SETTINGS');
var CREATE_SETTINGS = exports.CREATE_SETTINGS = asyncActionType('CREATE_SETTINGS');
var UPDATE_SETTINGS = exports.UPDATE_SETTINGS = asyncActionType('UPDATE_SETTINGS');
var RESET_SETTINGS = exports.RESET_SETTINGS = 'RESET_SETTINGS';

// upload
var FETCH_UPLOAD = exports.FETCH_UPLOAD = asyncActionType('FETCH_UPLOAD');
var RESET_UPLOAD = exports.RESET_UPLOAD = 'RESET_UPLOAD';

// user
var CREATE_USER = exports.CREATE_USER = asyncActionType('CREATE_USER');
var LOGIN_USER = exports.LOGIN_USER = asyncActionType('LOGIN_USER');
var LOGOUT_USER = exports.LOGOUT_USER = 'LOGOUT_USER';

/***/ }),
/* 13 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("react-redux");

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("react-styled-flexboxgrid");

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContentContainer = exports.LabelContainer = exports.ColumnContainer = exports.LayoutColumn = undefined;

var _taggedTemplateLiteral2 = __webpack_require__(20);

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  padding: 0 20px;\n  margin-left: 0;\n  margin-right: 0;\n  margin-bottom: 4em;\n\n  .Image {\n    margin-bottom: 1em;\n  }\n\n  .LinksList {\n    margin-top: calc(2em - 10px);\n    margin-bottom: 2em;\n  }\n'], ['\n  padding: 0 20px;\n  margin-left: 0;\n  margin-right: 0;\n  margin-bottom: 4em;\n\n  .Image {\n    margin-bottom: 1em;\n  }\n\n  .LinksList {\n    margin-top: calc(2em - 10px);\n    margin-bottom: 2em;\n  }\n']),
    _templateObject2 = (0, _taggedTemplateLiteral3.default)(['\n  margin-bottom: 1em;\n  padding: 0;\n'], ['\n  margin-bottom: 1em;\n  padding: 0;\n']),
    _templateObject3 = (0, _taggedTemplateLiteral3.default)(['\n  margin: 0 auto 0 0;\n  padding: 0;\n'], ['\n  margin: 0 auto 0 0;\n  padding: 0;\n']);

var _lodash = __webpack_require__(8);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactStyledFlexboxgrid = __webpack_require__(15);

var _description = __webpack_require__(52);

var _header = __webpack_require__(53);

var _label = __webpack_require__(54);

var _embed_list = __webpack_require__(32);

var _links_list = __webpack_require__(56);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LayoutColumn = exports.LayoutColumn = function LayoutColumn(props) {
  var children = props.children,
      item = props.item,
      label = props.label,
      labelLink = props.labelLink,
      model = props.model,
      onChange = props.onChange,
      setEditing = props.setEditing;


  var coverImage = void 0;
  var embed_codes = void 0;
  var images = void 0;
  var links = void 0;

  if (item) {
    embed_codes = item.embed_codes || [];
    links = item.links || [];
    images = (0, _lodash.clone)(item.images) || [];
    coverImage = images.length && images.splice(0, 1);
  }

  return _react2.default.createElement(
    ColumnContainer,
    null,
    _react2.default.createElement(
      LabelContainer,
      { xs: 12, sm: 2 },
      _react2.default.createElement(_label.Label, {
        label: label,
        labelLink: labelLink,
        model: model
      })
    ),
    _react2.default.createElement(
      ContentContainer,
      { xs: 12, sm: 6 },
      item && _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_header.ItemHeader, {
          coverImage: coverImage ? coverImage[0] : undefined,
          item: item,
          labelLink: labelLink,
          model: model,
          onChange: onChange,
          setEditing: setEditing
        }),
        _react2.default.createElement(_description.Description, {
          description: item.description,
          onChange: onChange && onChange
        }),
        links && _react2.default.createElement(_links_list.LinksList, { links: links }),
        embed_codes && _react2.default.createElement(_embed_list.EmbedList, { embed_codes: embed_codes })
      ),
      children
    )
  );
};

var ColumnContainer = exports.ColumnContainer = _reactStyledFlexboxgrid.Row.extend(_templateObject);

var LabelContainer = exports.LabelContainer = _reactStyledFlexboxgrid.Col.extend(_templateObject2);

var ContentContainer = exports.ContentContainer = _reactStyledFlexboxgrid.Col.extend(_templateObject3);

LayoutColumn.propTypes = {
  children: _propTypes2.default.any,
  item: _propTypes2.default.object,
  label: _propTypes2.default.string,
  labelLink: _propTypes2.default.any,
  model: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  setEditing: _propTypes2.default.func
};

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("mongoose");

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Modal = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _modal_background = __webpack_require__(115);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Modal = exports.Modal = function Modal(props) {
  var children = props.children,
      onClick = props.onClick;


  return _react2.default.createElement(
    ModalContainer,
    null,
    _react2.default.createElement(
      ModalContainerInner,
      null,
      children
    ),
    _react2.default.createElement(_modal_background.ModalBackground, {
      backgroundColor: 'rgba(0,0,0,.5)',
      onClick: onClick
    })
  );
};

var ModalContainer = _styledComponents2.default.div.withConfig({
  displayName: 'modal__ModalContainer',
  componentId: 'hja5cz-0'
})(['position:fixed;left:0;right:0;top:0;bottom:0;display:flex;justify-content:center;align-items:center;z-index:100;']);

var ModalContainerInner = _styledComponents2.default.div.withConfig({
  displayName: 'modal__ModalContainerInner',
  componentId: 'hja5cz-1'
})(['background:white;border:1px solid;padding:30px;z-index:10;width:600px;max-width:80vw;max-height:78vh;overflow:scroll;label{font-weight:600;padding-bottom:10px;display:block;}']);

Modal.propTypes = {
  children: _propTypes2.default.any.isRequired,
  onClick: _propTypes2.default.func.isRequired
};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/extends");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/taggedTemplateLiteral");

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetItem = exports.deleteItem = exports.updateItem = exports.fetchUpload = exports.maybeSaveItem = exports.changeItem = exports.fetchItem = exports.RESET_ITEM = exports.FETCH_ITEM_REQUESTED = exports.FETCH_ITEM_ERROR = exports.FETCH_ITEM_SUCCESS = undefined;

var _actions = __webpack_require__(12);

var _isomorphicFetch = __webpack_require__(28);

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _url = __webpack_require__(42);

var url = _interopRequireWildcard(_url);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var API_URL = "http://localhost:3000/api";
var FETCH_ITEM_SUCCESS = exports.FETCH_ITEM_SUCCESS = 'FETCH_ITEM_SUCCESS';
var FETCH_ITEM_ERROR = exports.FETCH_ITEM_ERROR = 'FETCH_ITEM_ERROR';
var FETCH_ITEM_REQUESTED = exports.FETCH_ITEM_REQUESTED = 'FETCH_ITEM_REQUESTED';
var RESET_ITEM = exports.RESET_ITEM = 'RESET_ITEM';

var fetchItem = exports.fetchItem = function fetchItem() {
  var model = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var id = arguments[1];
  var query = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  return function (dispatch) {
    var encodedURI = url.parse('' + API_URL + model + '/' + id);
    encodedURI.query = query;
    var formattedURI = url.format(encodedURI);

    dispatch({
      type: FETCH_ITEM_REQUESTED
    });

    return (0, _isomorphicFetch2.default)(formattedURI).then(function (res) {
      if (res) {
        if (!res.ok) {
          throw Error(res.status);
        }
        return res.json();
      }
    }).then(function (item) {
      dispatch({
        type: FETCH_ITEM_SUCCESS,
        payload: {
          item: item
        }
      });
      return item;
    }).catch(function (error) {
      dispatch({
        type: FETCH_ITEM_ERROR,
        payload: {
          error: { message: error.toString() }
        }
      });
      return null;
    });
  };
};

var changeItem = exports.changeItem = function changeItem(key, value) {
  return {
    type: _actions.CHANGE_ITEM,
    payload: {
      key: key,
      value: value
    }
  };
};

var maybeSaveItem = exports.maybeSaveItem = function maybeSaveItem(model, forceSave) {
  return function (dispatch, getState) {
    var item = getState().itemReducer.item;


    if (!item.published || forceSave) {
      dispatch(updateItem(model, item));
    }
  };
};

var fetchUpload = exports.fetchUpload = function fetchUpload(file, data, cb) {
  var name = file.name,
      type = file.type;


  return {
    type: _actions.API,
    payload: {
      method: 'post',
      url: '/upload',
      data: {
        fileName: name,
        fileType: type
      },
      next: _actions.FETCH_UPLOAD,
      cb: cb,
      file: file
    }
  };
};

var updateItem = exports.updateItem = function updateItem(model, item) {
  return {
    type: _actions.API,
    payload: {
      method: 'put',
      data: item,
      url: '/' + model + '/' + item._id,
      next: _actions.UPDATE_ITEM
    }
  };
};

var deleteItem = exports.deleteItem = function deleteItem(model, item) {
  return {
    type: _actions.API,
    payload: {
      method: 'delete',
      data: item,
      url: '/' + model + '/' + item._id,
      next: _actions.DELETE_ITEM
    }
  };
};

var resetItem = exports.resetItem = function resetItem() {
  return {
    type: RESET_ITEM
  };
};

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetItems = exports.fetchItems = exports.createItem = exports.RESET_ITEMS = exports.FETCH_ITEMS_REQUESTED = exports.FETCH_ITEMS_ERROR = exports.FETCH_ITEMS_SUCCESS = undefined;

var _isomorphicFetch = __webpack_require__(28);

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _url = __webpack_require__(42);

var url = _interopRequireWildcard(_url);

var _actions = __webpack_require__(12);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var API_URL = "http://localhost:3000/api";
var FETCH_ITEMS_SUCCESS = exports.FETCH_ITEMS_SUCCESS = 'FETCH_ITEMS_SUCCESS';
var FETCH_ITEMS_ERROR = exports.FETCH_ITEMS_ERROR = 'FETCH_ITEMS_ERROR';
var FETCH_ITEMS_REQUESTED = exports.FETCH_ITEMS_REQUESTED = 'FETCH_ITEMS_REQUESTED';
var RESET_ITEMS = exports.RESET_ITEMS = 'RESET_ITEMS';

var createItem = exports.createItem = function createItem(model) {
  // TODO: remove api middleware
  return {
    type: _actions.API,
    payload: {
      method: 'post',
      data: {},
      url: '/' + model,
      next: _actions.CREATE_ITEM
    }
  };
};

var fetchItems = exports.fetchItems = function fetchItems() {
  var model = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function (dispatch) {
    var encodedURI = url.parse('' + API_URL + model);
    encodedURI.query = query;
    var formattedURI = url.format(encodedURI);

    dispatch({
      type: FETCH_ITEMS_REQUESTED
    });

    return (0, _isomorphicFetch2.default)(formattedURI).then(function (res) {
      if (res) {
        return res.json();
      }
    }).then(function (items) {
      dispatch({
        type: FETCH_ITEMS_SUCCESS,
        payload: {
          items: items
        }
      });
      return items;
    }).catch(function (error) {
      console.error(error);
      dispatch({
        type: FETCH_ITEMS_ERROR,
        payload: {
          error: error
        }
      });
      return null;
    });
  };
};

var resetItems = exports.resetItems = function resetItems() {
  return {
    type: RESET_ITEMS
  };
};

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ErrorBoundary = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ErrorBoundary = exports.ErrorBoundary = function (_React$Component) {
  (0, _inherits3.default)(ErrorBoundary, _React$Component);

  function ErrorBoundary() {
    (0, _classCallCheck3.default)(this, ErrorBoundary);
    return (0, _possibleConstructorReturn3.default)(this, (ErrorBoundary.__proto__ || (0, _getPrototypeOf2.default)(ErrorBoundary)).apply(this, arguments));
  }

  (0, _createClass3.default)(ErrorBoundary, [{
    key: 'componentDidCatch',
    value: function componentDidCatch(error, errorInfo) {
      console.error(error);
    }
  }, {
    key: 'render',
    value: function render() {
      return this.props.children;
    }
  }]);
  return ErrorBoundary;
}(_react2.default.Component);

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Loading = undefined;

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactFontawesome = __webpack_require__(39);

var _reactFontawesome2 = _interopRequireDefault(_reactFontawesome);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Loading = exports.Loading = function Loading(props) {
  var isAbsolute = props.isAbsolute;


  return _react2.default.createElement(
    LoadingContainer,
    { isAbsolute: isAbsolute },
    _react2.default.createElement(_reactFontawesome2.default, {
      name: 'circle-o-notch',
      size: '2x',
      spin: true
    })
  );
};

var LoadingContainer = _styledComponents2.default.div.withConfig({
  displayName: 'loading__LoadingContainer',
  componentId: 'sc-5aikog-0'
})(['position:', ';top:0;left:0;right:0;bottom:0;display:flex;justify-content:center;align-items:center;color:#ddd;z-index:-1;'], function (props) {
  return props.isAbsolute ? 'absolute' : 'fixed';
});
Loading.propTypes = {
  isAbsolute: _propTypes2.default.bool
};

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVenue = exports.getReleaseDate = exports.getDate = exports.yearsMatch = exports.datesMatch = exports.dateIsUpcoming = exports.formatEventDate = exports.formatEventDates = exports.imageIsVertical = exports.sortByDate = undefined;

var _getIterator2 = __webpack_require__(132);

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _moment = __webpack_require__(59);

var _moment2 = _interopRequireDefault(_moment);

var _underscore = __webpack_require__(148);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sortByDate = exports.sortByDate = function sortByDate(items, dateField) {
  var upcoming = [];
  var past = [];

  if (items.length) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = (0, _getIterator3.default)(items), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        if (item) {
          var date = new Date(item[dateField]);

          if (new Date() < date) {
            upcoming.push(item);
          } else {
            past.push(item);
          }
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  return {
    upcoming: upcoming,
    past: past
  };
};

var imageIsVertical = exports.imageIsVertical = function imageIsVertical(image) {
  return image && image.aspect && image.aspect < 1.1;
};

var formatEventDates = exports.formatEventDates = function formatEventDates(item, format) {
  var end_date = item.end_date,
      start_date = item.start_date,
      all_day = item.all_day;

  var formattedStart = void 0;
  var formattedEnd = void 0;

  if (end_date) {
    var isUpcoming = dateIsUpcoming(end_date);
    var datesDoMatch = datesMatch(start_date, end_date);

    if (datesDoMatch) {
      // Start and end date is on same day
      if (!all_day) {
        // Nov 1, 2017 - 8:00-10:00pm
        formattedEnd = formatEventDate(end_date, false, !isUpcoming, format);
        var startTime = (0, _moment2.default)(start_date).format(' - h:mma');
        return formattedEnd + startTime;
      } else {
        // Nov 1, 2017
        return formatEventDate(end_date, true, !isUpcoming, format);
      }
    } else {
      // Start and end date on different days
      var yearsDoMatch = yearsMatch(start_date, end_date);
      formattedStart = formatEventDate(start_date, true, !yearsDoMatch, format);
      formattedEnd = formatEventDate(end_date, all_day, !yearsDoMatch, format);

      return formattedStart + ' - ' + formattedEnd;
    }
  } else {
    // Start date only
    var _isUpcoming = dateIsUpcoming(start_date);
    return formatEventDate(start_date, all_day, !_isUpcoming, format);
  }
};

var formatEventDate = exports.formatEventDate = function formatEventDate(date, allDay, hasYear) {
  var getYear = hasYear ? ', YYYY' : '';

  if (allDay) {
    return (0, _moment2.default)(date).format('ddd, MMM DD' + getYear);
  } else {
    return (0, _moment2.default)(date).format('ddd, MMM DD' + getYear + ' - h:mma');
  }
};

var dateIsUpcoming = exports.dateIsUpcoming = function dateIsUpcoming(date) {
  var now = (0, _moment2.default)().toISOString();
  return date > now;
};

var datesMatch = exports.datesMatch = function datesMatch(date1, date2) {
  return (0, _moment2.default)(date1).format('MMM DD, YYYY') === (0, _moment2.default)(date2).format('MMM DD, YYYY');
};

var yearsMatch = exports.yearsMatch = function yearsMatch(date1, date2) {
  return (0, _moment2.default)(date1).format('YYYY') === (0, _moment2.default)(date2).format('YYYY');
};

var getDate = exports.getDate = function getDate(model, item, format) {
  switch (model) {
    case 'events':
      return formatEventDates(item, format);
    case 'publications':
    case 'releases':
      return getReleaseDate(item);
    default:
      return null;
  }
};

var getReleaseDate = exports.getReleaseDate = function getReleaseDate(item) {
  var formats = item.formats;

  var dates = (0, _underscore.uniq)((0, _underscore.pluck)(formats, 'release_year'));

  if (dates.length) {
    var startDate = dates[0];

    if (dates.length > 1) {
      var endDate = dates[dates.length - 1];

      return endDate !== null ? startDate.toString() + '-' + endDate.toString().slice(-2) : startDate.toString();
    } else {
      if (startDate) {
        return startDate.toString();
      }
    }
  }
};

var getVenue = exports.getVenue = function getVenue(venue) {
  var _ref = venue || {},
      address = _ref.address,
      city = _ref.city,
      country = _ref.country,
      name = _ref.name;

  if (venue) {
    var City = city && city.length ? ', ' + city : '';
    var Country = country ? ', ' + country : '';

    if (venue && name && name.length) {
      return name + City + Country;
    } else if (venue && address && address.length) {
      return address + City + Country;
    }
  }
};

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetPage = exports.fetchPage = exports.RESET_PAGE = exports.FETCH_PAGE_REQUESTED = exports.FETCH_PAGE_ERROR = exports.FETCH_PAGE_SUCCESS = undefined;

var _isomorphicFetch = __webpack_require__(28);

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var API_URL = "http://localhost:3000/api";
var FETCH_PAGE_SUCCESS = exports.FETCH_PAGE_SUCCESS = 'FETCH_PAGE_SUCCESS';
var FETCH_PAGE_ERROR = exports.FETCH_PAGE_ERROR = 'FETCH_PAGE_ERROR';
var FETCH_PAGE_REQUESTED = exports.FETCH_PAGE_REQUESTED = 'FETCH_PAGE_REQUESTED';
var RESET_PAGE = exports.RESET_PAGE = 'RESET_PAGE';

var fetchPage = exports.fetchPage = function fetchPage(id) {
  var query = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function (dispatch) {
    var encodedURI = encodeURI(API_URL + '/pages' + id);

    dispatch({
      type: FETCH_PAGE_REQUESTED
    });

    return (0, _isomorphicFetch2.default)(encodedURI, query).then(function (res) {
      if (res) {
        return res.json();
      }
    }).then(function (page) {
      dispatch({
        type: FETCH_PAGE_SUCCESS,
        payload: {
          page: page
        }
      });
      return page;
    }).catch(function (error) {
      console.error(error);
      dispatch({
        type: FETCH_PAGE_ERROR,
        payload: {
          error: error
        }
      });
      return null;
    });
  };
};

var resetPage = exports.resetPage = function resetPage() {
  return {
    type: RESET_PAGE
  };
};

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Placeholder = exports.ColumnForm = exports.ErrorContainer = exports.Input = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Input = exports.Input = _styledComponents2.default.input.withConfig({
  displayName: 'forms__Input',
  componentId: 'sc-99v08g-0'
})(['font-size:1em;border-bottom:1px solid #ddd;border-left:0;border-right:0;border-top:0;padding-left:0;&:focus{outline:none;}&::placeholder,.public-DraftEditorPlaceholder-inner{color:#ddd;}']);

var ErrorContainer = exports.ErrorContainer = _styledComponents2.default.div.withConfig({
  displayName: 'forms__ErrorContainer',
  componentId: 'sc-99v08g-1'
})(['color:red;']);

var ColumnForm = exports.ColumnForm = _styledComponents2.default.form.withConfig({
  displayName: 'forms__ColumnForm',
  componentId: 'sc-99v08g-2'
})(['display:flex;flex-direction:column;', '{margin-bottom:0.5em;}button{margin-top:10px;}'], Input);

var Placeholder = exports.Placeholder = _styledComponents2.default.span.withConfig({
  displayName: 'forms__Placeholder',
  componentId: 'sc-99v08g-3'
})(['color:#ddd;']);

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("isomorphic-fetch");

/***/ }),
/* 29 */
/***/ (function(module, exports) {

module.exports = require("mongoose-slug-generator");

/***/ }),
/* 30 */
/***/ (function(module, exports) {

module.exports = require("react-router-dom");

/***/ }),
/* 31 */
/***/ (function(module, exports) {

module.exports = require("underscore.string");

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmbedList = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _lodash = __webpack_require__(8);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _embed2 = __webpack_require__(93);

var _button = __webpack_require__(9);

var _plain_text = __webpack_require__(48);

var _text = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EmbedList = exports.EmbedList = function (_Component) {
  (0, _inherits3.default)(EmbedList, _Component);

  function EmbedList() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, EmbedList);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = EmbedList.__proto__ || (0, _getPrototypeOf2.default)(EmbedList)).call.apply(_ref, [this].concat(args))), _this), _this.onNewEmbed = function (embed) {
      var _this$props = _this.props,
          embed_codes = _this$props.embed_codes,
          onChange = _this$props.onChange;


      embed_codes.push(embed);
      onChange(embed_codes);
      _this.setState({ lastUpdated: new Date() });
    }, _this.onRemoveEmbed = function (_embed, index) {
      var _this$props2 = _this.props,
          embed_codes = _this$props2.embed_codes,
          onChange = _this$props2.onChange;

      var newEmbeds = (0, _lodash.clone)(embed_codes);

      newEmbeds.splice(index, 1);
      onChange(newEmbeds);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(EmbedList, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          editing = _props.editing,
          embed_codes = _props.embed_codes,
          hasNew = _props.hasNew;


      return _react2.default.createElement(
        'div',
        null,
        embed_codes && embed_codes.length > 0 && embed_codes.map(function (embed_code, i) {
          return _react2.default.createElement(
            EmbedItem,
            { key: i },
            _react2.default.createElement(_embed2.Embed, { embed_code: embed_code }),
            editing && _react2.default.createElement(_button.Button, {
              icon: 'times',
              onClick: function onClick() {
                return _this2.onRemoveEmbed(embed_code, i);
              }
            })
          );
        }),
        hasNew && editing && _react2.default.createElement(
          _text.P,
          null,
          _react2.default.createElement(_plain_text.PlainText, {
            content: '',
            placeholder: 'Paste embed code...',
            onChange: function onChange(value) {
              return _this2.onNewEmbed(value);
            },
            forceUpdate: true
          })
        )
      );
    }
  }]);
  return EmbedList;
}(_react.Component);

EmbedList.propTypes = {
  editing: _propTypes2.default.bool,
  embed_codes: _propTypes2.default.array,
  hasNew: _propTypes2.default.bool,
  onChange: _propTypes2.default.func
};


var EmbedItem = _styledComponents2.default.div.withConfig({
  displayName: 'embed_list__EmbedItem',
  componentId: 'eu6p82-0'
})(['position:relative;width:100%;padding-bottom:20px;button{position:absolute;right:-5px;top:-5px;}']);

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormatsContainer = exports.Formats = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _button = __webpack_require__(9);

var _format = __webpack_require__(95);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Formats = exports.Formats = function Formats(props) {
  var formats = props.formats,
      short = props.short,
      onClick = props.onClick;


  return _react2.default.createElement(
    FormatsContainer,
    {
      condensed: short,
      onClick: onClick && onClick
    },
    formats && formats.length ? formats.map(function (item, index) {
      return _react2.default.createElement(_format.Format, {
        key: index,
        item: item,
        short: short
      });
    }) : onClick && _react2.default.createElement(_button.Button, { text: 'Add Format' })
  );
};

var FormatsContainer = exports.FormatsContainer = _styledComponents2.default.div.withConfig({
  displayName: 'formats__FormatsContainer',
  componentId: 'sc-1vsiqiy-0'
})(['', ''], function (props) {
  return props.condensed && '\n    display: flex;\n    div:first-child {\n      margin-right: 20px;\n    }\n  ';
});

Formats.propTypes = {
  formats: _propTypes2.default.array,
  onClick: _propTypes2.default.func,
  short: _propTypes2.default.bool
};

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImageContainer = exports.Caption = exports.Image = undefined;

var _underscore = __webpack_require__(31);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Image = exports.Image = function Image(props) {
  var editCaption = props.editCaption,
      caption = props.caption,
      url = props.url;

  var alt = (0, _underscore.stripTags)(caption) || '';

  return _react2.default.createElement(
    ImageContainer,
    null,
    _react2.default.createElement('img', {
      src: url,
      alt: alt,
      width: '100%'
    }),
    editCaption && _react2.default.createElement(
      Caption,
      null,
      editCaption
    ),
    caption && _react2.default.createElement(Caption, {
      dangerouslySetInnerHTML: { __html: caption }
    })
  );
};

var Caption = exports.Caption = _styledComponents2.default.div.withConfig({
  displayName: 'image__Caption',
  componentId: 'sc-17iwzz6-0'
})(['margin-top:5px;p,.public-DraftStyleDefault-block,.public-DraftEditorPlaceholder-root{margin:0;font-size:.7em;padding:0;text-align:right;color:#ddd;}']);

var ImageContainer = exports.ImageContainer = _styledComponents2.default.div.withConfig({
  displayName: 'image__ImageContainer',
  componentId: 'sc-17iwzz6-1'
})(['position:relative;margin-bottom:1em;button{z-index:1;position:absolute;right:-5px;top:-5px;padding:4px 8px;&:hover{color:red;}}']);

Image.propTypes = {
  editCaption: _propTypes2.default.any,
  caption: _propTypes2.default.string,
  url: _propTypes2.default.string
};

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ItemsList = undefined;

var _taggedTemplateLiteral2 = __webpack_require__(20);

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  &:hover {\n    color: #ddd;\n    cursor: pointer;\n  }\n  .fa {\n    margin-left: 10px;\n  }\n'], ['\n  &:hover {\n    color: #ddd;\n    cursor: pointer;\n  }\n  .fa {\n    margin-left: 10px;\n  }\n']),
    _templateObject2 = (0, _taggedTemplateLiteral3.default)(['\n  margin: 0;\n  padding: 0 10px;\n  @media (max-width: 76rem) {\n    padding: 0;\n  }\n'], ['\n  margin: 0;\n  padding: 0 10px;\n  @media (max-width: 76rem) {\n    padding: 0;\n  }\n']),
    _templateObject3 = (0, _taggedTemplateLiteral3.default)(['\n  padding: 0;\n  ', ' {\n    padding: 0 20px;\n    justify-content: space-evenly;\n  }\n'], ['\n  padding: 0;\n  ', ' {\n    padding: 0 20px;\n    justify-content: space-evenly;\n  }\n']);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactFontawesome = __webpack_require__(39);

var _reactFontawesome2 = _interopRequireDefault(_reactFontawesome);

var _reactStyledFlexboxgrid = __webpack_require__(15);

var _lodash = __webpack_require__(8);

var _utils = __webpack_require__(25);

var _list_item = __webpack_require__(111);

var _text = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItemsList = exports.ItemsList = function (_Component) {
  (0, _inherits3.default)(ItemsList, _Component);

  function ItemsList() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, ItemsList);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = ItemsList.__proto__ || (0, _getPrototypeOf2.default)(ItemsList)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      layout: _this.props.layout || 'list'
    }, _this.renderLabel = function () {
      var layout = _this.state.layout;
      var _this$props = _this.props,
          canToggle = _this$props.canToggle,
          label = _this$props.label,
          model = _this$props.model;

      var hasBorder = layout === 'table' || canToggle;
      var renderedLabel = label && label.length ? label : (0, _lodash.capitalize)(model);

      return _react2.default.createElement(
        ItemsListHeader,
        { layout: layout, canToggle: hasBorder },
        renderedLabel,
        canToggle && _this.renderLayoutToggle()
      );
    }, _this.renderLayoutToggle = function () {
      var layout = _this.state.layout;
      var model = _this.props.model;


      var isTable = layout === 'table';
      var toggleTo = isTable ? 'grid' : 'table';
      var text = isTable ? model === 'releases' ? 'Covers' : 'Posters' : 'List';
      var icon = isTable ? 'expand' : 'bars';

      return _react2.default.createElement(
        LayoutToggle,
        { onClick: function onClick() {
            return _this.setState({ layout: toggleTo });
          } },
        text,
        _react2.default.createElement(_reactFontawesome2.default, { name: icon })
      );
    }, _this.renderList = function (items) {
      var layout = _this.state.layout;
      var _this$props2 = _this.props,
          canToggle = _this$props2.canToggle,
          label = _this$props2.label;


      switch (layout) {
        case 'grid':
          if (label && !canToggle) {
            return _react2.default.createElement(
              ListContainer,
              { canToggle: canToggle, layout: layout },
              _react2.default.createElement(
                Content,
                { xs: 12, lg: 2 },
                _this.renderLabel()
              ),
              _react2.default.createElement(
                Content,
                { xs: 12, lg: 10 },
                _react2.default.createElement(
                  ItemGridContainer,
                  { canToggle: canToggle, layout: layout },
                  items
                )
              )
            );
          } else {
            return _react2.default.createElement(
              ItemGridContainer,
              { canToggle: canToggle, layout: layout },
              items
            );
          }
        default:
          return _react2.default.createElement(
            ListContainer,
            { canToggle: canToggle, layout: layout },
            items
          );
      }
    }, _this.renderListItems = function () {
      var layout = _this.state.layout;
      var _this$props3 = _this.props,
          canToggle = _this$props3.canToggle,
          list = _this$props3.list,
          model = _this$props3.model;


      return list.map(function (item, i) {
        var date = (0, _utils.getDate)(model, item);
        var venue = (0, _utils.getVenue)(item.venue);

        return _react2.default.createElement(_list_item.ListItem, {
          key: i,
          artist: item.artist,
          date: date,
          formats: item.formats,
          image: item.images[0],
          layout: layout,
          slug: '/' + model + '/' + (item.slug || item._id),
          title: item.title,
          venue: venue,
          published: item.published,
          publisher: item.publisher,
          condensed: canToggle
        });
      });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(ItemsList, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          canToggle = _props.canToggle,
          children = _props.children,
          comingSoon = _props.comingSoon,
          label = _props.label,
          list = _props.list;
      var layout = this.state.layout;

      var listItems = children || this.renderListItems();
      var hasLabel = label && layout !== 'grid' || layout === 'grid' && canToggle;

      return _react2.default.createElement(
        ItemsListContainer,
        {
          layout: layout,
          canToggle: canToggle
        },
        hasLabel && this.renderLabel(),
        list.length ? this.renderList(listItems) : comingSoon && 'Coming Soon'
      );
    }
  }]);
  return ItemsList;
}(_react.Component);

var ItemsListContainer = _styledComponents2.default.div.withConfig({
  displayName: 'items_list__ItemsListContainer',
  componentId: 'sc-1rlvyim-0'
})(['margin-bottom:3em;padding-left:0;padding-right:0;', ' ', ' @media (max-width:76rem){', '}'], function (props) {
  return props.layout !== 'table' && '\n    display: flex;\n  ';
}, function (props) {
  return props.canToggle && '\n    display: block;\n  ';
}, function (props) {
  return props.layout !== 'table' && '\n      flex-direction: column;\n    ';
});

var LayoutToggle = _text.H6.extend(_templateObject);

var ListContainer = _styledComponents2.default.div.withConfig({
  displayName: 'items_list__ListContainer',
  componentId: 'sc-1rlvyim-1'
})(['display:flex;flex:1;', ' ', ' @media (max-width:76rem){flex-direction:column;}'], function (props) {
  return props.layout === 'grid' && '\n    flex-wrap: wrap;\n    padding: 0;\n  ';
}, function (props) {
  return props.layout !== 'grid' && '\n    flex-direction: column;\n  ';
});

var ItemsListHeader = _styledComponents2.default.div.withConfig({
  displayName: 'items_list__ItemsListHeader',
  componentId: 'sc-1rlvyim-2'
})(['margin-top:0;font-weight:600;padding:0 20px;@media (max-width:76rem){padding:0 20px 10px;}', ''], function (props) {
  return props.canToggle && '\n    border-bottom: 1px solid;\n    padding: 0 20px 5px 20px;\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n  ';
});

var ItemGridContainer = _reactStyledFlexboxgrid.Row.extend(_templateObject2);

var Content = _reactStyledFlexboxgrid.Col.extend(_templateObject3, ItemGridContainer);

ItemsList.propTypes = {
  canToggle: _propTypes2.default.bool,
  children: _propTypes2.default.any,
  comingSoon: _propTypes2.default.bool,
  label: _propTypes2.default.string,
  layout: _propTypes2.default.string,
  list: _propTypes2.default.array.isRequired,
  model: _propTypes2.default.string.isRequired
};

/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/asyncToGenerator");

/***/ }),
/* 37 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/regenerator");

/***/ }),
/* 38 */
/***/ (function(module, exports) {

module.exports = require("draft-js");

/***/ }),
/* 39 */
/***/ (function(module, exports) {

module.exports = require("react-fontawesome");

/***/ }),
/* 40 */
/***/ (function(module, exports) {

module.exports = require("react-helmet");

/***/ }),
/* 41 */
/***/ (function(module, exports) {

module.exports = require("universal-cookie");

/***/ }),
/* 42 */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetSettings = exports.updateSettings = exports.createSettings = exports.fetchUpload = exports.fetchSettings = exports.FETCH_SETTINGS_REQUESTED = exports.FETCH_SETTINGS_ERROR = exports.FETCH_SETTINGS_SUCCESS = undefined;

var _actions = __webpack_require__(12);

var _upload = __webpack_require__(79);

var _isomorphicFetch = __webpack_require__(28);

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var API_URL = "http://localhost:3000/api";
var FETCH_SETTINGS_SUCCESS = exports.FETCH_SETTINGS_SUCCESS = 'FETCH_SETTINGS_SUCCESS';
var FETCH_SETTINGS_ERROR = exports.FETCH_SETTINGS_ERROR = 'FETCH_SETTINGS_ERROR';
var FETCH_SETTINGS_REQUESTED = exports.FETCH_SETTINGS_REQUESTED = 'FETCH_SETTINGS_REQUESTED';

var fetchSettings = exports.fetchSettings = function fetchSettings() {
  return function (dispatch) {
    var encodedURI = encodeURI(API_URL + '/settings');

    dispatch({
      type: FETCH_SETTINGS_REQUESTED
    });

    return (0, _isomorphicFetch2.default)(encodedURI).then(function (res) {
      if (res) {
        return res.json();
      }
    }).then(function (settings) {
      dispatch({
        type: FETCH_SETTINGS_SUCCESS,
        payload: {
          settings: settings
        }
      });
      return settings;
    }).catch(function (error) {
      console.error(error);
      dispatch({
        type: FETCH_SETTINGS_ERROR,
        payload: {
          error: error
        }
      });
      return null;
    });
  };
};

// export const fetchSettings = () => {
//   return {
//     type: API,
//     payload: {
//       method: 'get',
//       url: '/settings',
//       next: FETCH_SETTINGS
//     }
//   }
// }

var fetchUpload = exports.fetchUpload = function fetchUpload(file, data, cb) {
  return (0, _upload.getUploadSignature)(file, data, cb);
};

var createSettings = exports.createSettings = function createSettings(settings) {
  return {
    type: _actions.API,
    payload: {
      method: 'post',
      data: settings,
      url: '/settings',
      next: _actions.CREATE_SETTINGS
    }
  };
};

var updateSettings = exports.updateSettings = function updateSettings(settings) {
  return {
    type: _actions.API,
    payload: {
      method: 'put',
      data: settings,
      url: '/settings/' + settings._id,
      next: _actions.UPDATE_SETTINGS
    }
  };
};

var resetSettings = exports.resetSettings = function resetSettings() {
  return {
    type: _actions.RESET_SETTINGS
  };
};

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logoutUser = exports.loginUser = exports.createUser = undefined;

var _actions = __webpack_require__(12);

var _universalCookie = __webpack_require__(41);

var _universalCookie2 = _interopRequireDefault(_universalCookie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cookies = new _universalCookie2.default();

var createUser = exports.createUser = function createUser(creds) {
  return {
    type: _actions.API,
    payload: {
      method: 'post',
      data: creds,
      url: '/users',
      next: _actions.CREATE_USER
    }
  };
};

var loginUser = exports.loginUser = function loginUser(creds) {
  return {
    type: _actions.API,
    payload: {
      method: 'post',
      data: creds,
      url: '/users/session/create',
      next: _actions.LOGIN_USER
    }
  };
};

var logoutUser = exports.logoutUser = function logoutUser() {
  cookies.remove('portfolio.session');
  return {
    type: _actions.LOGOUT_USER
  };
};

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotFound = undefined;

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _column = __webpack_require__(16);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NotFound = exports.NotFound = function NotFound() {
  return _react2.default.createElement(
    _column.ColumnContainer,
    null,
    '404 Not Found'
  );
};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CheckboxInput = undefined;

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _text = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CheckboxInput = exports.CheckboxInput = function CheckboxInput(props) {
  var label = props.label,
      value = props.value,
      _onChange = props.onChange;


  return _react2.default.createElement(
    CheckboxInputContainer,
    null,
    _react2.default.createElement('input', {
      type: 'checkbox',
      defaultChecked: value,
      onChange: function onChange(e) {
        return _onChange(e.target.checked);
      }
    }),
    label && _react2.default.createElement(
      _text.H5,
      null,
      label
    )
  );
};

CheckboxInput.propTypes = {
  label: _propTypes2.default.string,
  value: _propTypes2.default.bool,
  onChange: _propTypes2.default.func.isRequired
};

var CheckboxInputContainer = _styledComponents2.default.div.withConfig({
  displayName: 'checkbox_input__CheckboxInputContainer',
  componentId: 'sc-9i1dw6-0'
})(['display:flex;align-items:center;input{margin:0;}', '{padding:0 0 0 0.5em;}'], _text.H5);

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RichText = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _draftJs = __webpack_require__(38);

var _draftConvert = __webpack_require__(140);

var _util = __webpack_require__(103);

var _url_input = __webpack_require__(102);

var _url_input2 = _interopRequireDefault(_url_input);

var _button = __webpack_require__(9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RichText = exports.RichText = function (_Component) {
  (0, _inherits3.default)(RichText, _Component);

  function RichText(props) {
    (0, _classCallCheck3.default)(this, RichText);

    var _this = (0, _possibleConstructorReturn3.default)(this, (RichText.__proto__ || (0, _getPrototypeOf2.default)(RichText)).call(this, props));

    _this.inputToHtml = function (editorState) {
      var html = (0, _draftConvert.convertToHTML)({
        entityToHTML: function entityToHTML(entity, originalText) {
          if (entity.type === 'LINK') {
            return _react2.default.createElement(
              'a',
              { href: entity.data.url },
              originalText
            );
          }
          return originalText;
        }
      })(editorState.getCurrentContent());

      return html;
    };

    _this.inputFromHTML = function (html) {
      var blocksFromHTML = (0, _draftConvert.convertFromHTML)({
        htmlToEntity: function htmlToEntity(nodeName, node) {
          if (nodeName === 'a') {
            return _draftJs.Entity.create('LINK', 'MUTABLE', { url: node.href });
          }
        }
      })(html);
      var editorState = _draftJs.EditorState.createWithContent(blocksFromHTML, _util.decorator);
      return editorState;
    };

    _this.onChange = function (editorState) {
      var currentContentState = _this.state.editorState.getCurrentContent();
      var newContentState = editorState.getCurrentContent();
      var html = _this.inputToHtml(editorState);

      if (currentContentState !== newContentState) {
        // There was a change in the content
        _this.onContentChange(html);
      }
      _this.setState({
        editorState: editorState,
        html: html
      });
    };

    _this.onContentChange = function (html) {
      var _this$props = _this.props,
          name = _this$props.name,
          onChange = _this$props.onChange;


      if (name) {
        onChange(name, html);
      } else {
        onChange(html);
      }
    };

    _this.handleKeyCommand = function (command) {
      var newState = _draftJs.RichUtils.handleKeyCommand(_this.state.editorState, command);

      if (newState) {
        _this.onChange(newState);
        return 'handled';
      }
      return 'not-handled';
    };

    _this.promptForLink = function () {
      var editorState = _this.state.editorState;

      var selection = editorState.getSelection();

      if (!selection.isCollapsed()) {
        var contentState = editorState.getCurrentContent();
        var startKey = selection.getStartKey();
        var startOffset = selection.getStartOffset();
        var blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
        var linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
        var urlValue = '';

        if (linkKey) {
          var linkInstance = contentState.getEntity(linkKey);
          urlValue = linkInstance.getData().url;
        }

        _this.setState({
          showUrlInput: true,
          urlValue: urlValue
        });
      }
    };

    _this.confirmLink = function (url) {
      var editorState = _this.state.editorState;

      var contentState = editorState.getCurrentContent();
      var contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', { url: url });
      var entityKey = contentStateWithEntity.getLastCreatedEntityKey();
      var newEditorState = _draftJs.EditorState.set(editorState, { currentContent: contentStateWithEntity });

      _this.setState({
        editorState: _draftJs.RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey),
        showUrlInput: false,
        urlValue: ''
      }, function () {
        setTimeout(function () {
          return _this.refs.editor.focus();
        }, 0);
      });
    };

    _this.checkSelection = function () {
      var editorState = _this.state.editorState;

      var showMenu = false;

      if (!editorState.getSelection().isCollapsed()) {
        showMenu = true;
      }
      _this.setState({ showMenu: showMenu });
    };

    _this.state = {
      editorState: _draftJs.EditorState.createEmpty(_util.decorator),
      html: props.html || null,
      showUrlInput: false,
      showMenu: false,
      urlValue: ''
    };

    _this.focus = function () {
      return _this.refs.editor.focus();
    };
    return _this;
  }

  (0, _createClass3.default)(RichText, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var html = this.props.html;


      if (html) {
        this.setState({
          editorState: this.inputFromHTML(html)
        });
      }
    }
  }, {
    key: 'renderLinkInput',
    value: function renderLinkInput() {
      var _state = this.state,
          showUrlInput = _state.showUrlInput,
          urlValue = _state.urlValue;


      if (showUrlInput) {
        return _react2.default.createElement(_url_input2.default, {
          confirmLink: this.confirmLink,
          url: urlValue
        });
      }
    }
  }, {
    key: 'renderMenu',
    value: function renderMenu() {
      if (this.state.showMenu) {
        return _react2.default.createElement(
          _button.Button,
          { onClick: this.promptForLink },
          'Link'
        );
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var placeholder = this.props.placeholder;
      var editorState = this.state.editorState;


      return _react2.default.createElement(
        RichTextContainer,
        null,
        this.renderMenu(),
        this.renderLinkInput(),
        _react2.default.createElement(
          'div',
          {
            onClick: this.focus,
            onKeyUp: this.checkSelection,
            onMouseUp: this.checkSelection },
          _react2.default.createElement(_draftJs.Editor, {
            ref: 'editor',
            placeholder: placeholder,
            editorState: editorState,
            handleKeyCommand: this.handleKeyCommand,
            onChange: this.onChange
          })
        )
      );
    }
  }]);
  return RichText;
}(_react.Component);

RichText.propTypes = {
  html: _propTypes2.default.string,
  name: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  placeholder: _propTypes2.default.string
};


var RichTextContainer = _styledComponents2.default.div.withConfig({
  displayName: 'rich_text__RichTextContainer',
  componentId: 'iwuryp-0'
})(['position:relative;.public-DraftEditorPlaceholder-root{position:absolute;left:0;right:0;top:0;color:gray;}']);

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlainText = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _draftJs = __webpack_require__(38);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PlainText = exports.PlainText = function (_Component) {
  (0, _inherits3.default)(PlainText, _Component);

  function PlainText() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, PlainText);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = PlainText.__proto__ || (0, _getPrototypeOf2.default)(PlainText)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      editorState: _this.setEditorState()
    }, _this.onChange = function (editorState) {
      var forceUpdate = _this.props.forceUpdate;

      var currentContentState = _this.state.editorState.getCurrentContent();
      var newContentState = editorState.getCurrentContent();
      var newContent = newContentState.getPlainText();

      if (currentContentState !== newContentState) {
        // There was a change in the content
        _this.onContentChange(newContent);
      }

      if (forceUpdate) {
        _this.setState({ editorState: _this.setEditorState() });
      } else {
        _this.setState({ editorState: editorState });
      }
    }, _this.onContentChange = function (content) {
      var _this$props = _this.props,
          name = _this$props.name,
          onChange = _this$props.onChange;


      if (name) {
        onChange(name, content);
      } else {
        onChange(content);
      }
    }, _this.focus = function () {
      _this.editor.focus();
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(PlainText, [{
    key: 'setEditorState',
    value: function setEditorState() {
      if (this.props.content) {
        return this.setStateWithContent();
      } else {
        return _draftJs.EditorState.createEmpty();
      }
    }
  }, {
    key: 'setStateWithContent',
    value: function setStateWithContent() {
      var content = _draftJs.ContentState.createFromText(this.props.content);
      return _draftJs.EditorState.createWithContent(content);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          name = _props.name,
          placeholder = _props.placeholder;


      return _react2.default.createElement(
        PlainTextContainer,
        {
          name: name,
          onClick: this.focus
        },
        _react2.default.createElement(_draftJs.Editor, {
          editorState: this.state.editorState,
          handleReturn: function handleReturn() {
            return 'handled';
          },
          onChange: this.onChange,
          placeholder: placeholder || 'Start Typing...',
          ref: function ref(_ref2) {
            _this2.editor = _ref2;
          },
          spellcheck: true
        })
      );
    }
  }]);
  return PlainText;
}(_react.Component);

var PlainTextContainer = _styledComponents2.default.div.withConfig({
  displayName: 'plain_text__PlainTextContainer',
  componentId: 'wxy8ck-0'
})(['position:relative;.public-DraftEditorPlaceholder-root{position:absolute;color:#ddd;}']);

PlainText.propTypes = {
  content: _propTypes2.default.string,
  forceUpdate: _propTypes2.default.bool,
  name: _propTypes2.default.string,
  onChange: _propTypes2.default.func.isRequired,
  placeholder: _propTypes2.default.string
};

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectInput = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var States = ['', 'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

var SelectInput = exports.SelectInput = function (_Component) {
  (0, _inherits3.default)(SelectInput, _Component);

  function SelectInput() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, SelectInput);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = SelectInput.__proto__ || (0, _getPrototypeOf2.default)(SelectInput)).call.apply(_ref, [this].concat(args))), _this), _this.renderLabel = function () {
      var _this$props = _this.props,
          label = _this$props.label,
          name = _this$props.name;


      if (label && label.length > 0) {
        return _react2.default.createElement(
          'label',
          null,
          label
        );
      } else if (label) {
        return _react2.default.createElement(
          'label',
          null,
          name
        );
      }
    }, _this.renderOptions = function (options) {
      if (_this.props.states) {
        options = States;
      }

      var renderOptions = options.map(function (value, i) {
        return _react2.default.createElement(
          'option',
          { key: i, value: value },
          value
        );
      });
      return renderOptions;
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(SelectInput, [{
    key: 'renderInput',
    value: function renderInput() {
      var _props = this.props,
          name = _props.name,
          value = _props.value,
          required = _props.required,
          options = _props.options,
          _onChange = _props.onChange;


      return _react2.default.createElement(
        'select',
        {
          required: required || false,
          name: name,
          defaultValue: value,
          onChange: function onChange(e) {
            return _onChange(name, e.target.value);
          } },
        this.renderOptions(options)
      );
    }
  }, {
    key: 'render',
    value: function render() {
      // const { required, label } = this.props

      // TODO: Required indicators
      // var group = label ? ' input-group' : ''
      // var req = required ? ' req' : ''

      return _react2.default.createElement(
        'div',
        null,
        this.renderLabel(),
        this.renderInput()
      );
    }
  }]);
  return SelectInput;
}(_react.Component);

SelectInput.propTypes = {
  label: _propTypes2.default.string,
  name: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  options: _propTypes2.default.array,
  required: _propTypes2.default.bool,
  states: _propTypes2.default.bool,
  value: _propTypes2.default.any
};

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImageEdit = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _lodash = __webpack_require__(8);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _button = __webpack_require__(9);

var _file_input = __webpack_require__(101);

var _image = __webpack_require__(34);

var _rich_text = __webpack_require__(47);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ImageEdit = exports.ImageEdit = function (_Component) {
  (0, _inherits3.default)(ImageEdit, _Component);

  function ImageEdit(props) {
    (0, _classCallCheck3.default)(this, ImageEdit);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ImageEdit.__proto__ || (0, _getPrototypeOf2.default)(ImageEdit)).call(this, props));

    _initialiseProps.call(_this);

    var _props$item = props.item,
        aspect = _props$item.aspect,
        caption = _props$item.caption,
        url = _props$item.url;


    _this.state = {
      item: {
        aspect: aspect || null,
        caption: caption || '',
        url: url || false
      }
    };
    return _this;
  }

  (0, _createClass3.default)(ImageEdit, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          editCaption = _props.editCaption,
          index = _props.index,
          fetchUpload = _props.fetchUpload,
          showInput = _props.showInput;
      var item = this.state.item;
      var caption = item.caption,
          url = item.url;


      return _react2.default.createElement(
        'div',
        null,
        showInput ? _react2.default.createElement(_file_input.FileInput, {
          hasPreview: index !== -1,
          fetchUpload: fetchUpload,
          onChange: function onChange(image) {
            return _this2.onChangeImage(image, index);
          },
          onDelete: function onDelete() {
            return _this2.onDeleteImage();
          },
          file: item
        }) : _react2.default.createElement(
          _image.ImageContainer,
          null,
          _react2.default.createElement(_button.Button, {
            icon: 'times',
            onClick: this.onDeleteImage
          }),
          _react2.default.createElement(_image.Image, {
            url: url,
            caption: !editCaption && caption || '',
            editCaption: editCaption && this.editCaption()
          })
        )
      );
    }
  }]);
  return ImageEdit;
}(_react.Component);

ImageEdit.propTypes = {
  editCaption: _propTypes2.default.bool,
  fetchUpload: _propTypes2.default.func,
  onChange: _propTypes2.default.func.isRequired,
  onDelete: _propTypes2.default.func,
  index: _propTypes2.default.number,
  item: _propTypes2.default.object,
  showInput: _propTypes2.default.bool
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.onChangeImage = function (item) {
    var _props2 = _this3.props,
        index = _props2.index,
        onChange = _props2.onChange;


    _this3.setState({ item: item });
    onChange(item, index);
  };

  this.onChangeText = function (caption) {
    var _props3 = _this3.props,
        index = _props3.index,
        item = _props3.item;

    var newImage = (0, _lodash.clone)(item);

    newImage.caption = caption;
    _this3.onChangeImage(newImage, index);
  };

  this.onDeleteImage = function () {
    var _props4 = _this3.props,
        index = _props4.index,
        onChange = _props4.onChange,
        onDelete = _props4.onDelete;


    if (onDelete) {
      onDelete(index);
    } else {
      onChange();
    }
  };

  this.editCaption = function () {
    var caption = _this3.state.item.caption;


    return _react2.default.createElement(
      _image.Caption,
      null,
      _react2.default.createElement(_rich_text.RichText, {
        onChange: _this3.onChangeText,
        html: caption,
        placeholder: 'Image Caption'
      })
    );
  };
};

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Item = undefined;

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _utils = __webpack_require__(25);

var _column = __webpack_require__(16);

var _grid = __webpack_require__(55);

var _item_edit = __webpack_require__(107);

var _item_edit2 = _interopRequireDefault(_item_edit);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Item = exports.Item = function Item(props) {
  var editing = props.editing,
      model = props.model,
      item = props.item;


  var images = item && item.images || [];
  var isPublication = model === 'publications';
  var isGrid = images.length !== 0 && ((0, _utils.imageIsVertical)(images[0]) || isPublication);

  return _react2.default.createElement(
    'div',
    null,
    editing ? _react2.default.createElement(_item_edit2.default, props) : isGrid ? _react2.default.createElement(_grid.LayoutGrid, props) : _react2.default.createElement(_column.LayoutColumn, props)
  );
};

Item.propTypes = {
  editing: _propTypes2.default.bool,
  item: _propTypes2.default.object,
  label: _propTypes2.default.string,
  labelLink: _propTypes2.default.bool,
  layout: _propTypes2.default.string,
  model: _propTypes2.default.string
};

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DescriptionContainer = exports.Description = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _rich_text = __webpack_require__(47);

var _text = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Description = exports.Description = function Description(props) {
  var description = props.description,
      _onChange = props.onChange,
      placeholder = props.placeholder;


  return _react2.default.createElement(
    DescriptionContainer,
    null,
    _onChange ? _react2.default.createElement(
      _text.P,
      null,
      _react2.default.createElement(_rich_text.RichText, {
        html: description,
        placeholder: placeholder || 'Start typing...',
        onChange: function onChange(value) {
          return _onChange('description', value);
        }
      })
    ) : _react2.default.createElement(_text.P, { dangerouslySetInnerHTML: { __html: description } })
  );
};

var DescriptionContainer = exports.DescriptionContainer = _styledComponents2.default.div.withConfig({
  displayName: 'description__DescriptionContainer',
  componentId: 'po9k98-0'
})(['margin-bottom:1em;']);

Description.propTypes = {
  description: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  placeholder: _propTypes2.default.string
};

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ItemHeader = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(8);

var _utils = __webpack_require__(25);

var _formats = __webpack_require__(33);

var _image = __webpack_require__(34);

var _image_edit = __webpack_require__(50);

var _text = __webpack_require__(10);

var _text2 = __webpack_require__(116);

var _venue = __webpack_require__(117);

var _label = __webpack_require__(54);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItemHeader = exports.ItemHeader = function ItemHeader(props) {
  var coverImage = props.coverImage,
      item = props.item,
      label = props.label,
      labelLink = props.labelLink,
      model = props.model,
      _onChange = props.onChange,
      setEditing = props.setEditing;
  var artist = item.artist,
      formats = item.formats,
      venue = item.venue,
      title = item.title;

  var _ref = coverImage || '',
      url = _ref.url;

  var hasImage = coverImage && url;
  var hasVenue = venue && (venue.name || venue.address);
  var isPublication = model === 'publications';
  var date = !isPublication && (0, _utils.getDate)(model, item);

  return _react2.default.createElement(
    ItemHeaderContainer,
    { model: model },
    label && _react2.default.createElement(_label.Label, {
      label: label,
      labelLink: labelLink,
      model: model
    }),
    (artist || isPublication && setEditing) && _react2.default.createElement(
      _text.H1,
      null,
      _react2.default.createElement(_text2.Text, {
        onChange: setEditing ? function (value) {
          return _onChange('artist', value);
        } : undefined,
        placeholder: 'Artist',
        text: artist
      })
    ),
    model !== 'pages' && _react2.default.createElement(
      _text.H1,
      null,
      _react2.default.createElement(_text2.Text, {
        onChange: setEditing ? function (value) {
          return _onChange('title', value);
        } : undefined,
        placeholder: 'Add Title',
        text: title
      })
    ),
    date && _react2.default.createElement(
      _text.H4,
      { onClick: setEditing ? function () {
          return setEditing('dates');
        } : undefined },
      date
    ),
    (formats || isPublication && setEditing) && _react2.default.createElement(_formats.Formats, {
      formats: formats || [],
      onClick: setEditing ? function () {
        return setEditing('formats');
      } : undefined
    }),
    (hasVenue || model === 'events' && setEditing) && _react2.default.createElement(_venue.Venue, {
      venue: venue || {},
      onClick: setEditing ? function () {
        return setEditing('venue');
      } : undefined
    }),
    hasImage && _onChange ? _react2.default.createElement(_image_edit.ImageEdit, {
      item: coverImage,
      index: 0,
      onChange: function onChange(image) {
        var newImages = (0, _lodash.clone)(item.images) || [];
        if (image) {
          newImages[0] = image;
        } else {
          newImages.splice(0, 1);
        }
        _onChange('images', newImages);
      },
      editCaption: true
    }) : hasImage && _react2.default.createElement(_image.Image, coverImage)
  );
};

ItemHeader.propTypes = {
  coverImage: _propTypes2.default.object,
  event: _propTypes2.default.object,
  item: _propTypes2.default.object,
  label: _propTypes2.default.string,
  labelLink: _propTypes2.default.any,
  model: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  setEditing: _propTypes2.default.func
};

var ItemHeaderContainer = _styledComponents2.default.div.withConfig({
  displayName: 'header__ItemHeaderContainer',
  componentId: 'sc-8m51jp-0'
})(['margin-bottom:2em;', '{margin-top:-6px;.public-DraftStyleDefault-block,.public-DraftEditorPlaceholder-root{padding:0;}}', '{margin-bottom:.5em;}', ' ', ':{margin-bottom:1em;}'], _text.H1, _text.H4, function (props) {
  return props.model !== 'pages' && '\n    ' + _image.ImageContainer + ' {\n      margin-top: 2em;\n    }\n  ';
}, _venue.VenueContainer);

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Label = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _underscore = __webpack_require__(31);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Label = exports.Label = function Label(props) {
  var label = props.label,
      labelLink = props.labelLink,
      model = props.model;

  var formattedLabel = (0, _underscore.capitalize)(label);
  var formattedModel = model ? '/' + model : undefined;

  if (model === 'publications' && label === 'Release') {
    formattedModel = '/releases';
  }

  return _react2.default.createElement(
    LabelContainer,
    null,
    labelLink && formattedModel ? _react2.default.createElement(
      'a',
      { href: formattedModel },
      formattedLabel
    ) : formattedLabel
  );
};

var LabelContainer = _styledComponents2.default.label.withConfig({
  displayName: 'label__LabelContainer',
  componentId: 'fsdh6n-0'
})(['font-weight:600;padding-bottom:15px;display:block;a{text-decoration:none;}']);

Label.propTypes = {
  label: _propTypes2.default.string,
  labelLink: _propTypes2.default.bool,
  model: _propTypes2.default.string
};

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LayoutGrid = undefined;

var _taggedTemplateLiteral2 = __webpack_require__(20);

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  padding: 0 20px;\n  margin-left: 0;\n  margin-right: 0;\n  margin-bottom: 4em;\n\n  .Image {\n    margin-bottom: 1em;\n  }\n\n  .LinksList {\n    margin-top: calc(2em - 10px);\n    margin-bottom: 2em;\n  }\n'], ['\n  padding: 0 20px;\n  margin-left: 0;\n  margin-right: 0;\n  margin-bottom: 4em;\n\n  .Image {\n    margin-bottom: 1em;\n  }\n\n  .LinksList {\n    margin-top: calc(2em - 10px);\n    margin-bottom: 2em;\n  }\n']),
    _templateObject2 = (0, _taggedTemplateLiteral3.default)(['\n  margin-right: 30px;\n  max-width: 450px !important;\n  padding-bottom: 30px;\n\n  @media (max-width: 46rem) {\n    max-width: 100% !important;\n  }\n'], ['\n  margin-right: 30px;\n  max-width: 450px !important;\n  padding-bottom: 30px;\n\n  @media (max-width: 46rem) {\n    max-width: 100% !important;\n  }\n']);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactStyledFlexboxgrid = __webpack_require__(15);

var _description = __webpack_require__(52);

var _header = __webpack_require__(53);

var _embed_list = __webpack_require__(32);

var _images_show = __webpack_require__(106);

var _links_list = __webpack_require__(56);

var _column = __webpack_require__(16);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LayoutGrid = exports.LayoutGrid = function LayoutGrid(props) {
  var item = props.item,
      label = props.label,
      labelLink = props.labelLink,
      model = props.model,
      onChange = props.onChange,
      setEditing = props.setEditing;
  var description = item.description,
      embed_codes = item.embed_codes;


  var images = item.images || [];
  var gridCoverImage = images.length > 0 ? images[0] : undefined;

  return _react2.default.createElement(
    GridContainer,
    null,
    _react2.default.createElement(
      MediaContainer,
      { xs: 12, sm: gridCoverImage ? 5 : 2 },
      gridCoverImage && _react2.default.createElement(_images_show.ImagesShow, { images: images }),
      embed_codes && _react2.default.createElement(_embed_list.EmbedList, { embed_codes: embed_codes })
    ),
    _react2.default.createElement(
      _column.ContentContainer,
      { xs: 12, sm: 6 },
      _react2.default.createElement(_header.ItemHeader, {
        item: item,
        label: label,
        labelLink: labelLink,
        model: model,
        setEditing: setEditing,
        onChange: onChange
      }),
      _react2.default.createElement(_description.Description, {
        description: description,
        onChange: onChange
      }),
      _react2.default.createElement(_links_list.LinksList, { links: item.links || [] })
    )
  );
};

var GridContainer = _reactStyledFlexboxgrid.Row.extend(_templateObject);

var MediaContainer = _reactStyledFlexboxgrid.Col.extend(_templateObject2);

LayoutGrid.propTypes = {
  item: _propTypes2.default.object,
  label: _propTypes2.default.string,
  labelLink: _propTypes2.default.any,
  model: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  setEditing: _propTypes2.default.func
};

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinksList = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LinksList = exports.LinksList = function LinksList(props) {
  var links = props.links;


  return _react2.default.createElement(
    LinksContainer,
    null,
    links.length > 0 && links.map(function (link, i) {
      return _react2.default.createElement(
        'div',
        { key: i },
        _react2.default.createElement(
          'a',
          { href: link.url, target: '_blank' },
          link.title ? link.title : link.url
        )
      );
    })
  );
};

LinksList.propTypes = {
  links: _propTypes2.default.array.isRequired
};

var LinksContainer = _styledComponents2.default.div.withConfig({
  displayName: 'links_list__LinksContainer',
  componentId: 'sc-7emin5-0'
})(['margin-bottom:1.75em;']);

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routes = undefined;

var _item = __webpack_require__(21);

var _items = __webpack_require__(22);

var _page = __webpack_require__(26);

var _Item = __webpack_require__(81);

var _Item2 = _interopRequireDefault(_Item);

var _Items = __webpack_require__(82);

var _Items2 = _interopRequireDefault(_Items);

var _Page = __webpack_require__(85);

var _Page2 = _interopRequireDefault(_Page);

var _login = __webpack_require__(88);

var _login2 = _interopRequireDefault(_login);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HOMEPAGE_ENABLED = process.env.HOMEPAGE_ENABLED;


var getQuery = function getQuery(store) {
  if (!store.getState().user.isAuthenticated) {
    return { published: true };
  }
  return {};
};

var HomeRoute = {
  path: '/',
  exact: true,
  component: HOMEPAGE_ENABLED ? _Page2.default : _Items2.default,
  model: HOMEPAGE_ENABLED ? undefined : 'events',
  title: 'Home',
  fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var store = arguments[1];

    if (HOMEPAGE_ENABLED) {
      return store.dispatch((0, _page.fetchPage)('/home'));
    } else {
      return store.dispatch((0, _items.fetchItems)('/events', getQuery(store)));
    }
  }
};

var routes = exports.routes = [HomeRoute, {
  path: '/events/:id',
  model: 'events',
  component: _Item2.default,
  fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var store = arguments[1];

    return store.dispatch((0, _item.fetchItem)('/events', path.split('/').pop(), getQuery(store)));
  }
}, {
  path: '/events',
  component: _Items2.default,
  model: 'events',
  title: 'Events',
  fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var store = arguments[1];

    return store.dispatch((0, _items.fetchItems)(path, getQuery(store)));
  }
}, {
  path: '/info',
  component: _Item2.default,
  title: 'Info',
  model: 'pages',
  fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var store = arguments[1];

    return store.dispatch((0, _item.fetchItem)('/pages', path.split('/').pop(), getQuery(store)));
  }
}, {
  path: '/login',
  component: _login2.default,
  title: 'Login'
}, {
  path: '/projects/:id',
  model: 'projects',
  component: _Item2.default,
  fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var store = arguments[1];

    return store.dispatch((0, _item.fetchItem)('/projects', path.split('/').pop(), getQuery(store)));
  }
}, {
  path: '/projects',
  component: _Items2.default,
  model: 'projects',
  title: 'Projects',
  fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var store = arguments[1];

    return store.dispatch((0, _items.fetchItems)(path, getQuery(store)));
  }
}, {
  path: '/releases/:id',
  model: 'publications',
  component: _Item2.default,
  fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var store = arguments[1];

    return store.dispatch((0, _item.fetchItem)('/publications', path.split('/').pop(), getQuery(store)));
  }
}, {
  path: '/releases',
  component: _Items2.default,
  model: 'publications',
  title: 'Releases',
  fetchInitialData: function fetchInitialData() {
    var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var store = arguments[1];

    return store.dispatch((0, _items.fetchItems)('/publications', getQuery(store)));
  }
}];

/***/ }),
/* 58 */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),
/* 59 */
/***/ (function(module, exports) {

module.exports = require("moment");

/***/ }),
/* 60 */
/***/ (function(module, exports) {

module.exports = require("react-router");

/***/ }),
/* 61 */
/***/ (function(module, exports) {

module.exports = require("redux");

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _regenerator = __webpack_require__(37);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = __webpack_require__(134);

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = __webpack_require__(36);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _bodyParser = __webpack_require__(137);

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cors = __webpack_require__(139);

var _cors2 = _interopRequireDefault(_cors);

var _express = __webpack_require__(13);

var _express2 = _interopRequireDefault(_express);

var _mongoose = __webpack_require__(17);

var _mongoose2 = _interopRequireDefault(_mongoose);

var _morgan = __webpack_require__(143);

var _morgan2 = _interopRequireDefault(_morgan);

var _reactRouterDom = __webpack_require__(30);

var _universalCookieExpress = __webpack_require__(149);

var _universalCookieExpress2 = _interopRequireDefault(_universalCookieExpress);

var _universalCookie = __webpack_require__(41);

var _universalCookie2 = _interopRequireDefault(_universalCookie);

var _store = __webpack_require__(129);

var _store2 = _interopRequireDefault(_store);

var _settings = __webpack_require__(43);

var _routes = __webpack_require__(57);

var _render = __webpack_require__(130);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _process$env = process.env,
    MONGODB_URI = "mongodb://eve:8b9WtmYwhoxjARs@ds149613.mlab.com:49613/heroku_w1zc0zqw",
    MONGODB_TEST_URI = "mongodb://localhost/portfolio-test",
    PORT = "3000",
    NODE_ENV = "development";


var app = (0, _express2.default)();

var port = void 0;
var db = void 0;

if (NODE_ENV === 'test') {
  console.log('starting test server');
  port = 5000;
  db = MONGODB_TEST_URI;
} else {
  port = PORT || 3000;
  db = MONGODB_URI;
  app.use((0, _morgan2.default)('dev'));
}

if (NODE_ENV === 'production') {
  app.use(function (req, res, next) {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect('https://' + req.header('host') + req.url);
    } else {
      next();
    }
  });
}

_mongoose2.default.connect(db, { useNewUrlParser: true, useCreateIndex: true }).then(function () {
  console.log('Mongodb connected');
}).catch(function (err) {
  console.log('Mongodb error', err);
});

app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use((0, _universalCookieExpress2.default)());

app.use(function (req, res, next) {
  next();
});

app.use('/robots.txt', function (_req, res, _next) {
  res.type('text/plain');
  res.send('');
});

app.use((0, _cors2.default)());
app.use(_express2.default.static('public'));
app.use('/api', __webpack_require__(77));

app.get('*', function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(req, res, next) {
    var cookies, session, _createStore, store, settings, activeRoute, promiseData;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            cookies = new _universalCookie2.default(req.headers.cookie);
            session = cookies.get('portfolio.session');
            _createStore = (0, _store2.default)({ entry: req.url, session: session }), store = _createStore.store;
            _context.next = 5;
            return store.dispatch((0, _settings.fetchSettings)());

          case 5:
            settings = _context.sent;
            activeRoute = _routes.routes.find(function (route) {
              return (0, _reactRouterDom.matchPath)(req.url, route);
            });
            promiseData = activeRoute && activeRoute.fetchInitialData ? activeRoute.fetchInitialData(req.path, store) : _promise2.default.resolve();


            promiseData.then(function (data) {
              var context = { data: data, settings: settings };
              var content = (0, _render.ServerRender)(req, store, context);

              res.send(content);
            }).catch(next);

          case 9:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}());

app.listen(port, function () {
  console.log('Server is listening on port:' + port);
});

/***/ }),
/* 63 */
/***/ (function(module, exports) {

module.exports = require("babel-polyfill");

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _assign = __webpack_require__(11);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = __webpack_require__(13);
var events = express.Router();
var Event = __webpack_require__(65);

var _require = __webpack_require__(8),
    extend = _require.extend;

function queryByIdOrSlug(id) {
  var reqQuery = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var query = extend(reqQuery, { $or: [{ slug: id }] });
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({ _id: id });
  }
  return query;
}

events.route('/')
// create event
.post(function (req, res) {
  var item = new Event();
  item.slug = item._id;
  (0, _assign2.default)(item, req.body).save(function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    res.json({ message: 'Event created', data: data });
  });
})
// all events
.get(function (req, res) {
  Event.find(req.query).sort({ start_date: 'desc' }).exec(function (err, data) {
    if (err) {
      res.send(err);
    }
    res.json(data);
  });
});

events.route('/new')
// new event
.get(function (req, res) {
  var data = new Event();
  res.json(data);
});

events.route('/:id')
// single event
.get(function (req, res) {
  var query = queryByIdOrSlug(req.params.id, req.query);
  Event.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    if (!data) {
      return res.status(404).send(new Error('not found'));
    }
    res.json(data);
  });
}).put(function (req, res) {
  var query = queryByIdOrSlug(req.params.id, req.query);
  Event.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    (0, _assign2.default)(data, req.body).save(function (err, data) {
      if (err) {
        return res.status(400).send(err);
      }
      res.json(data);
    });
  });
}).delete(function (req, res) {
  var query = queryByIdOrSlug(req.params.id);
  Event.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    Event.remove({
      _id: data._id
    }, function (err) {
      if (err) {
        return res.status(400).send(err);
      }
      res.json({ message: 'Event deleted' });
    });
  });
});

module.exports = events;

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var mongoose = __webpack_require__(17);
var Schema = mongoose.Schema;
var slug = __webpack_require__(29);

mongoose.plugin(slug);

var EventSchema = new Schema({
  all_day: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  end_date: { type: Date, default: null },
  embed_codes: [],
  description: String,
  images: [{
    caption: { type: String },
    url: { type: String },
    aspect: { type: Number }
  }],
  links: [{
    title: { type: String },
    url: { type: String }
  }],
  meta: {
    description: String
  },
  start_date: { type: Date, default: Date.now },
  slug: {
    type: String,
    slug: ['title'],
    slug_padding_size: 2,
    unique: true
  },
  title: String,
  updated_at: { type: Date, default: Date.now },
  venue: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String
  },
  project_ids: { type: Array, default: [] },
  published: { type: Boolean, default: false }
});

module.exports = mongoose.model('Event', EventSchema);

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _assign = __webpack_require__(11);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = __webpack_require__(13);
var pages = express.Router();
var Page = __webpack_require__(67);

var _require = __webpack_require__(8),
    extend = _require.extend;

function queryByIdOrSlug(id) {
  var reqQuery = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var query = extend(reqQuery, { $or: [{ slug: id }] });
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({ _id: id });
  }
  return query;
}

pages.route('/')
// create page
.post(function (req, res) {
  var item = new Page();
  item.slug = item._id;
  (0, _assign2.default)(item, req.body).save(function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    res.json({ message: 'Page created', data: data });
  });
})
// all pages
.get(function (req, res) {
  Page.find(req.query).exec(function (err, data) {
    if (err) {
      res.send(err);
    }
    res.json(data);
  });
});

pages.route('/new')
// new page
.get(function (req, res) {
  var data = new Page();
  res.json(data);
});

pages.route('/:id')
// single page
.get(function (req, res) {
  var query = queryByIdOrSlug(req.params.id, req.query);

  Page.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    if (!data) {
      return res.status(404).send(new Error('not found'));
    }
    res.json(data);
  });
}).put(function (req, res) {
  var query = queryByIdOrSlug(req.params.id, req.query);
  Page.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    (0, _assign2.default)(data, req.body).save(function (err, data) {
      if (err) {
        return res.status(400).send(err);
      }
      res.json(data);
    });
  });
}).delete(function (req, res) {
  var query = queryByIdOrSlug(req.params.id);
  Page.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    Page.remove({
      _id: data._id
    }, function (err) {
      if (err) {
        return res.status(400).send(err);
      }
      res.json({ message: 'Page deleted' });
    });
  });
});

module.exports = pages;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var mongoose = __webpack_require__(17);
var Schema = mongoose.Schema;
var slug = __webpack_require__(29);

mongoose.plugin(slug);

var PageSchema = new Schema({
  title: String,
  description: String,
  slug: {
    type: String,
    slug: ['title'],
    slug_padding_size: 2,
    unique: true
  },
  images: { type: Array, default: [] },
  embed_codes: [],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false }
});

module.exports = mongoose.model('Page', PageSchema);

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _assign = __webpack_require__(11);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = __webpack_require__(13);
var projects = express.Router();
var Project = __webpack_require__(69);

var _require = __webpack_require__(8),
    extend = _require.extend;

function queryByIdOrSlug(id) {
  var reqQuery = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var query = extend(reqQuery, { $or: [{ slug: id }] });
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({ _id: id });
  }
  return query;
}

projects.route('/')
// create project
.post(function (req, res) {
  var item = new Project();
  item.slug = item._id;
  (0, _assign2.default)(item, req.body).save(function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    res.json({ message: 'Project created', data: data });
  });
})
// all projects
.get(function (req, res) {
  Project.find(req.query).sort({ 'list_index': 'asc' }).exec(function (err, data) {
    if (err) {
      res.send(err);
    }
    res.json(data);
  });
});

projects.route('/new')
// new projects
.get(function (req, res) {
  var data = new Project();
  res.json(data);
});

projects.route('/:id')
// single projects
.get(function (req, res) {
  var query = queryByIdOrSlug(req.params.id, req.query);
  Project.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    if (!data) {
      return res.status(404).send(new Error('not found'));
    }
    res.json(data);
  });
}).put(function (req, res) {
  var query = queryByIdOrSlug(req.params.id, req.query);
  Project.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    (0, _assign2.default)(data, req.body).save(function (err, data) {
      if (err) {
        return res.status(400).send(err);
      }
      res.json(data);
    });
  });
}).delete(function (req, res) {
  var query = queryByIdOrSlug(req.params.id);
  Project.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    Project.remove({
      _id: data._id
    }, function (err) {
      if (err) {
        return res.status(400).send(err);
      }
      res.json({ message: 'Project deleted' });
    });
  });
});

module.exports = projects;

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var mongoose = __webpack_require__(17);
var Schema = mongoose.Schema;
var slug = __webpack_require__(29);

mongoose.plugin(slug);

var ProjectSchema = new Schema({
  active: Boolean,
  created_at: { type: Date, default: Date.now },
  description: String,
  embed_codes: [String],
  end_date: Date,
  images: [{
    caption: { type: String },
    url: { type: String },
    aspect: { type: Number }
  }],
  links: [{
    title: { type: String },
    url: { type: String }
  }],
  published: { type: Boolean, default: false },
  start_date: Date,
  slug: {
    type: String,
    slug: ['title'],
    slug_padding_size: 2,
    unique: true
  },
  title: String,
  updated_at: { type: Date, default: Date.now },
  list_index: Number
});

module.exports = mongoose.model('Project', ProjectSchema);

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _assign = __webpack_require__(11);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = __webpack_require__(13);
var publications = express.Router();
var Publication = __webpack_require__(71);

var _require = __webpack_require__(8),
    extend = _require.extend;

function queryByIdOrSlug(id) {
  var reqQuery = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var query = extend(reqQuery, { $or: [{ slug: id }] });
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    query.$or.push({ _id: id });
  }
  return query;
}

publications.route('/')
// create publication
.post(function (req, res) {
  var item = new Publication();
  item.slug = item._id;
  (0, _assign2.default)(item, req.body).save(function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    res.json({ message: 'Publication created', data: data });
  });
})
// all publications
.get(function (req, res) {
  Publication.find(req.query).exec(function (err, data) {
    if (err) {
      res.send(err);
    }
    res.json(data);
  });
});

publications.route('/new')
// new publication
.get(function (req, res) {
  var data = new Publication();
  res.json(data);
});

publications.route('/:id')
// single publication
.get(function (req, res) {
  var query = queryByIdOrSlug(req.params.id, req.query);
  Publication.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    if (!data) {
      return res.status(404).send(new Error('not found'));
    }
    res.json(data);
  });
}).put(function (req, res) {
  var query = queryByIdOrSlug(req.params.id, req.query);
  Publication.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    (0, _assign2.default)(data, req.body).save(function (err, data) {
      if (err) {
        return res.status(400).send(err);
      }
      res.json(data);
    });
  });
}).delete(function (req, res) {
  var query = queryByIdOrSlug(req.params.id);
  Publication.findOne(query, function (err, data) {
    if (err) {
      return res.status(400).send(err);
    }
    Publication.remove({
      _id: data._id
    }, function (err) {
      if (err) {
        return res.status(400).send(err);
      }
      res.json({ message: 'Publication deleted' });
    });
  });
});

module.exports = publications;

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var mongoose = __webpack_require__(17);
var Schema = mongoose.Schema;
var slug = __webpack_require__(29);

mongoose.plugin(slug);

var PublicationSchema = new Schema({
  artist: String,
  title: String,
  formats: [{
    publisher: { type: String },
    format: { type: String },
    release_year: { type: Number },
    compilation: { type: Boolean, default: false },
    featuring: { type: Boolean, default: false }
  }],
  embed_codes: { type: Array, default: [] },
  description: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
  project_ids: { type: Array, default: [] },
  images: [{
    caption: { type: String },
    url: { type: String },
    aspect: { type: Number }
  }],
  links: [{
    title: { type: String },
    url: { type: String }
  }],
  slug: {
    type: String,
    slug: ['artist', 'title'],
    slug_padding_size: 2,
    unique: true
  }
});

module.exports = mongoose.model('Publication', PublicationSchema);

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _assign = __webpack_require__(11);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = __webpack_require__(13);
var settings = express.Router();
var Settings = __webpack_require__(73);

// for /api/settings/

settings.route('/')
// create setting
.post(function (req, res) {
  var settings = new Settings();
  (0, _assign2.default)(settings, req.body).save(function (err, settings) {
    if (err) {
      return res.status(400).send(err);
    }
    res.json({ message: 'Settings created', settings: settings });
  });
})
// all settings
.get(function (req, res) {
  Settings.findOne(req.query).exec(function (err, settings) {
    if (err) {
      res.send(err);
    }
    res.json(settings);
  });
});

settings.route('/:settings_id')
// update settings
.put(function (req, res) {
  Settings.findById(req.params.settings_id, function (err, settings) {
    if (err) {
      return res.status(400).send(err);
    }
    (0, _assign2.default)(settings, req.body).save(function (err, settings) {
      if (err) {
        return res.status(400).send(err);
      }
      res.json({ message: 'Settings updated', settings: settings });
    });
  });
});

module.exports = settings;

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var mongoose = __webpack_require__(17);
var Schema = mongoose.Schema;

var SettingsSchema = new Schema({
  title: String,
  description: String,
  about: {
    embed_codes: { type: Array, default: [] },
    description: String,
    social: {
      bandcamp: String,
      twitter: String,
      instagram: String,
      facebook: String,
      soundcloud: String
    },
    images: [{
      caption: { type: String },
      url: { type: String },
      aspect: { type: Number }
    }]
  },
  nav: [],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Settings', SettingsSchema);

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(13);
var upload = express.Router();
var aws = __webpack_require__(131);
var S3_BUCKET = "eve-portfolio";

aws.config.region = 'us-east-1';

upload.route('/').post(function (req, res) {
  var s3 = new aws.S3({
    signatureVersion: 'v4'
  });
  var s3Params = {
    Bucket: S3_BUCKET,
    Key: req.body.fileName,
    Expires: 60,
    ContentType: req.body.fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, function (err, data) {
    if (err) {
      console.log(err);
      return res.end();
    }
    var signature = {
      signedRequest: data,
      url: 'https://' + S3_BUCKET + '.s3.amazonaws.com/' + req.body.fileName
    };
    res.json(signature);
  });
});

module.exports = upload;

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _assign = __webpack_require__(11);

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = __webpack_require__(13);
var users = express.Router();
var User = __webpack_require__(76);
var jwt = __webpack_require__(142);
// for /api/users/

users.route('/')
// create user
.post(function (req, res) {
  var user = new User();
  (0, _assign2.default)(user, req.body).save(function (err, user) {
    if (err) {
      return res.status(400).send(err);
    }
    var email = user.email,
        _id = user._id;

    var session = jwt.sign({ email: email, _id: _id }, 'secret', { expiresIn: '30d' });

    res.json({
      message: 'User created',
      currentUser: { email: email, _id: _id },
      session: session
    });
  });
})

// all users
.get(function (req, res) {
  User.find(function (err, users) {
    if (err) {
      return res.send(err);
    }
    res.json(users);
  });
});

users.route('/session/create').post(function (req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      return res.send(err);
    } else if (!user) {
      return res.send(400, { error: 'User not found' });
    } else {
      // test password match
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (!isMatch || err) {
          return res.send(400, { error: err || 'Incorrect password' });
        }
        var email = user.email,
            _id = user._id;

        var session = jwt.sign({ email: email, _id: _id }, 'secret', { expiresIn: '30d' });
        return res.json({
          currentUser: { email: email, _id: _id },
          session: session
        });
      });
    }
  });
});

users.route('/:user_id')
// single user
.get(function (req, res) {
  User.findById(req.params.user_id, function (err, user) {
    if (err) {
      return res.send(err);
    }
    res.json(user);
  });
}).put(function (req, res) {
  User.findById(req.params.user_id, function (err, user) {
    if (err) {
      return res.send(err);
    }
    (0, _assign2.default)(user, req.body).save(function (err, user) {
      if (err) {
        return res.send(err);
      }
      res.json({ message: 'User updated', user: user });
    });
  });
}).delete(function (req, res) {
  User.remove({
    _id: req.params.user_id
  }, function (err) {
    if (err) {
      return res.send(err);
    }
    res.json({ message: 'User deleted' });
  });
});

module.exports = users;

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bcrypt = __webpack_require__(136);
var mongoose = __webpack_require__(17);
var Schema = mongoose.Schema;
var SALT_WORK_FACTOR = 7;

var UserSchema = new Schema({
  name_first: String,
  name_last: String,
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

UserSchema.pre('save', function (next) {
  var user = this;
  var now = new Date();
  if (!user.created_at) {
    user.created_at = now;
    next();
  }
  user.updated_at = now;

  if (!user.isModified('password')) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var express = __webpack_require__(13);
var apiV1 = express.Router();

apiV1.use('/events', __webpack_require__(64));
apiV1.use('/pages', __webpack_require__(66));
apiV1.use('/projects', __webpack_require__(68));
apiV1.use('/publications', __webpack_require__(70));
apiV1.use('/settings', __webpack_require__(72));
apiV1.use('/upload', __webpack_require__(74));
apiV1.use('/users', __webpack_require__(75));

module.exports = apiV1;

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.App = undefined;

var _extends2 = __webpack_require__(19);

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = __webpack_require__(135);

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactHelmet = __webpack_require__(40);

var _reactRouterDom = __webpack_require__(30);

var _theme = __webpack_require__(128);

var _routes = __webpack_require__(57);

var _ErrorBoundary = __webpack_require__(23);

var _Nav = __webpack_require__(90);

var _Nav2 = _interopRequireDefault(_Nav);

var _NotFound = __webpack_require__(45);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PAGE_TITLE = "Eve Essex";

var App = exports.App = function (_Component) {
  (0, _inherits3.default)(App, _Component);

  function App() {
    (0, _classCallCheck3.default)(this, App);
    return (0, _possibleConstructorReturn3.default)(this, (App.__proto__ || (0, _getPrototypeOf2.default)(App)).apply(this, arguments));
  }

  (0, _createClass3.default)(App, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _styledComponents.ThemeProvider,
        { theme: _theme.theme },
        _react2.default.createElement(
          Content,
          null,
          _react2.default.createElement(_Nav2.default, null),
          _react2.default.createElement(
            _ErrorBoundary.ErrorBoundary,
            null,
            _react2.default.createElement(
              Main,
              null,
              _react2.default.createElement(
                _reactRouterDom.Switch,
                null,
                _routes.routes.map(function (_ref) {
                  var path = _ref.path,
                      exact = _ref.exact,
                      Component = _ref.component,
                      title = _ref.title,
                      rest = (0, _objectWithoutProperties3.default)(_ref, ['path', 'exact', 'component', 'title']);
                  return _react2.default.createElement(_reactRouterDom.Route, { key: path, path: path, exact: exact, render: function render(props) {
                      return _react2.default.createElement(
                        'div',
                        null,
                        _react2.default.createElement(_reactHelmet.Helmet, {
                          titleTemplate: '%s | ' + (title || PAGE_TITLE),
                          defaultTitle: PAGE_TITLE,
                          title: PAGE_TITLE
                        }),
                        _react2.default.createElement(Component, (0, _extends3.default)({}, props, rest))
                      );
                    } });
                }),
                _react2.default.createElement(_reactRouterDom.Route, { render: function render(props) {
                    return _react2.default.createElement(_NotFound.NotFound, props);
                  } })
              )
            )
          )
        )
      );
    }
  }]);
  return App;
}(_react.Component);

var Main = _styledComponents2.default.main.withConfig({
  displayName: 'App__Main',
  componentId: 'sc-1gqodob-0'
})(['padding-top:2.5em;']);

var Content = _styledComponents2.default.div.withConfig({
  displayName: 'App__Content',
  componentId: 'sc-1gqodob-1'
})(['font-family:\'Roboto\',\'helvetica neue\',\'helvetica\',\'arial\',\'sans-serif\';font-size:16px;line-height:1.2em;letter-spacing:.015em;a{color:black;&:hover{color:#ddd;}}']);

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUploadSignature = undefined;

var _actions = __webpack_require__(12);

var getUploadSignature = exports.getUploadSignature = function getUploadSignature(file, data, cb) {
  var name = file.name,
      type = file.type;


  return {
    type: _actions.API,
    payload: {
      method: 'post',
      url: '/upload',
      data: { fileName: name, fileType: type },
      next: _actions.FETCH_UPLOAD,
      cb: cb,
      file: file
    }
  };
};

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Home = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _column = __webpack_require__(16);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Home = exports.Home = function Home(props) {
  var _props$page = props.page,
      description = _props$page.description,
      images = _props$page.images;

  var backgroundImg = images && images[0] && images[0].url;

  return _react2.default.createElement(
    _column.ColumnContainer,
    null,
    backgroundImg && _react2.default.createElement(PageBackground, { backgroundImg: backgroundImg }),
    description && _react2.default.createElement(PageDescription, { dangerouslySetInnerHTML: { __html: description } })
  );
};

var PageBackground = _styledComponents2.default.div.withConfig({
  displayName: 'Home__PageBackground',
  componentId: 'sc-1hqq6ks-0'
})(['background-color:orange;', ' position:fixed;top:0;left:0;bottom:0;right:0;z-index:-1;'], function (props) {
  return props.backgroundImg && '\n    background: url(' + props.backgroundImg + ');\n    background-position: center;\n    background-size: cover;\n  ';
});

var PageDescription = _styledComponents2.default.div.withConfig({
  displayName: 'Home__PageDescription',
  componentId: 'sc-1hqq6ks-1'
})(['max-width:500px;font-size:2em;line-height:1.15em;']);

Home.propTypes = {
  page: _propTypes2.default.object
};

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Item = undefined;

var _keys = __webpack_require__(133);

var _keys2 = _interopRequireDefault(_keys);

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _reactRedux = __webpack_require__(14);

var _underscore = __webpack_require__(31);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactHelmet = __webpack_require__(40);

var _url = __webpack_require__(42);

var url = _interopRequireWildcard(_url);

var _ErrorBoundary = __webpack_require__(23);

var _NotFound = __webpack_require__(45);

var _loading = __webpack_require__(24);

var _item = __webpack_require__(51);

var _item2 = __webpack_require__(21);

var itemActions = _interopRequireWildcard(_item2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BASE_URL = "http://localhost:3000";


var prettyDescription = function prettyDescription(html) {
  return (0, _underscore.truncate)((0, _underscore.stripTags)(html), 150);
};

var getMetaData = function getMetaData(meta) {
  var item = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var description = item.description,
      title = item.title;


  var metaDescription = description ? prettyDescription(description) : meta.description;
  return [{ name: 'description', content: metaDescription }, { property: 'og:title', content: title }];
};

var Item = exports.Item = function (_Component) {
  (0, _inherits3.default)(Item, _Component);

  function Item(props) {
    (0, _classCallCheck3.default)(this, Item);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Item.__proto__ || (0, _getPrototypeOf2.default)(Item)).call(this, props));

    _this.fetchItem = function () {
      var _this$props = _this.props,
          item = _this$props.item,
          fetchItemAction = _this$props.fetchItemAction,
          path = _this$props.match.path,
          model = _this$props.model;

      var param = item._id;
      var formattedModel = path === '/releases' ? '/publications' : path;

      if (model === 'pages') {
        formattedModel = '/pages';
        param = path;
      }

      fetchItemAction(formattedModel, param);
    };

    _this.getApp = function (item, metaData) {
      var model = _this.props.model;
      var isEditing = _this.state.isEditing;

      var isPage = model === 'pages';
      var formattedLabel = model === 'publications' ? 'Release' : isPage ? 'Info' : model;

      switch (model) {
        default:
          {
            return _react2.default.createElement(
              _react2.default.Fragment,
              null,
              _react2.default.createElement(_reactHelmet.Helmet, {
                title: !isPage ? item.title : undefined,
                meta: getMetaData(metaData, item)
              }),
              _react2.default.createElement(_item.Item, {
                item: item,
                label: formattedLabel,
                labelLink: true,
                model: model,
                editing: isEditing
              })
            );
          }
      }
    };

    var data = void 0;
    var meta = void 0;
    if (false) {
      data = window.__INITIAL_DATA__ && window.__INITIAL_DATA__.data;
      meta = window.__INITIAL_DATA__ && window.__INITIAL_DATA__.settings;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
      meta = props.staticContext.settings;
    }
    _this.state = { data: data, meta: meta, isEditing: false };
    return _this;
  }

  (0, _createClass3.default)(Item, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _props = this.props,
          item = _props.item,
          loading = _props.loading;


      if ((!item || !(0, _keys2.default)(item).length) && !loading) {
        this.fetchItem();
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.isAuthenticated && false) {
        this.setState({ isEditing: true });
      }
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(prevProps) {
      var _props2 = this.props,
          item = _props2.item,
          loading = _props2.loading;

      var prevSlug = url.parse(BASE_URL + prevProps.match.url).href.split('/').pop();

      if (prevSlug !== item.slug && !loading) {
        this.fetchItem();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _state = this.state,
          data = _state.data,
          meta = _state.meta;
      var error = this.props.error;

      var item = data && data || this.props.item;
      var metaData = meta && meta || this.props.settings;

      if (!item || this.props.loading) {
        return _react2.default.createElement(_loading.Loading, null);
      }if (error && error.message.includes('404')) {
        return _react2.default.createElement(_NotFound.NotFound, null);
      } else {
        return _react2.default.createElement(
          _ErrorBoundary.ErrorBoundary,
          { error: error },
          this.getApp(item, metaData)
        );
      }
    }
  }]);
  return Item;
}(_react.Component);

Item.propTypes = {
  error: _propTypes2.default.object,
  fetchItemAction: _propTypes2.default.func,
  isAuthenticated: _propTypes2.default.any,
  item: _propTypes2.default.object,
  loading: _propTypes2.default.bool,
  match: _propTypes2.default.any,
  model: _propTypes2.default.string,
  staticContext: _propTypes2.default.any,
  settings: _propTypes2.default.object
};


var mapStateToProps = function mapStateToProps(_ref) {
  var itemReducer = _ref.itemReducer,
      settingsReducer = _ref.settingsReducer,
      user = _ref.user;
  return {
    error: itemReducer.error,
    item: itemReducer.item,
    loading: itemReducer.loading,
    settings: settingsReducer.settings,
    isAuthenticated: user.isAuthenticated
  };
};

var mapDispatchToProps = {
  fetchItemAction: itemActions.fetchItem
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Item);

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Items = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _reactRedux = __webpack_require__(14);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _ErrorBoundary = __webpack_require__(23);

var _items = __webpack_require__(22);

var itemsActions = _interopRequireWildcard(_items);

var _Events = __webpack_require__(83);

var _Projects = __webpack_require__(86);

var _Publications = __webpack_require__(87);

var _loading = __webpack_require__(24);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Items = exports.Items = function (_Component) {
  (0, _inherits3.default)(Items, _Component);

  function Items(props) {
    (0, _classCallCheck3.default)(this, Items);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Items.__proto__ || (0, _getPrototypeOf2.default)(Items)).call(this, props));

    _this.fetchItems = function () {
      var _this$props = _this.props,
          isAuthenticated = _this$props.isAuthenticated,
          fetchItemsAction = _this$props.fetchItemsAction,
          path = _this$props.match.path;

      var query = isAuthenticated ? {} : { published: true };
      var formattedPath = path === '/releases' ? '/publications' : path;

      fetchItemsAction(formattedPath, query);
    };

    _this.getApp = function (items) {
      var _this$props2 = _this.props,
          model = _this$props2.model,
          title = _this$props2.title;


      switch (model) {
        case 'events':
          {
            return _react2.default.createElement(_Events.Events, { items: items });
          }
        case 'projects':
          {
            return _react2.default.createElement(_Projects.Projects, { items: items });
          }
        case 'publications':
        case 'releases':
          {
            return _react2.default.createElement(_Publications.Publications, { items: items, title: title });
          }
        default:
          {
            return _react2.default.createElement(
              'ul',
              null,
              items.map(function (item) {
                return _react2.default.createElement(
                  'li',
                  { key: item._id },
                  item.title
                );
              })
            );
          }
      }
    };

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data };
    return _this;
  }

  (0, _createClass3.default)(Items, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _props = this.props,
          items = _props.items,
          loading = _props.loading;


      if ((!items || items.length === 0) && !loading) {
        this.fetchItems();
      }
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(prevProps) {
      var path = this.props.match.path;


      if (prevProps.match.path !== path) {
        this.fetchItems();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var data = this.state.data;
      var error = this.props.error;

      var items = data && data || this.props.items;

      if (!items || this.props.loading) {
        return _react2.default.createElement(_loading.Loading, null);
      } else {
        return _react2.default.createElement(
          _ErrorBoundary.ErrorBoundary,
          { error: error },
          this.getApp(items)
        );
      }
    }
  }]);
  return Items;
}(_react.Component);

Items.propTypes = {
  error: _propTypes2.default.object,
  fetchItemsAction: _propTypes2.default.func,
  isAuthenticated: _propTypes2.default.bool,
  items: _propTypes2.default.array,
  title: _propTypes2.default.string,
  loading: _propTypes2.default.bool,
  match: _propTypes2.default.any,
  model: _propTypes2.default.string,
  staticContext: _propTypes2.default.any
};


var mapStateToProps = function mapStateToProps(_ref) {
  var itemsReducer = _ref.itemsReducer,
      user = _ref.user;
  return {
    error: itemsReducer.error,
    items: itemsReducer.list,
    loading: itemsReducer.loading,
    isAuthenticated: user.isAuthenticated
  };
};

var mapDispatchToProps = {
  fetchItemsAction: itemsActions.fetchItems
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Items);

/***/ }),
/* 83 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Events = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _utils = __webpack_require__(25);

var _items_list = __webpack_require__(35);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Events = exports.Events = function (_Component) {
  (0, _inherits3.default)(Events, _Component);

  function Events() {
    (0, _classCallCheck3.default)(this, Events);
    return (0, _possibleConstructorReturn3.default)(this, (Events.__proto__ || (0, _getPrototypeOf2.default)(Events)).apply(this, arguments));
  }

  (0, _createClass3.default)(Events, [{
    key: 'render',
    value: function render() {
      var items = this.props.items;

      var upcoming = (0, _utils.sortByDate)(items, 'start_date').upcoming.reverse();
      var past = (0, _utils.sortByDate)(items, 'start_date').past;

      return _react2.default.createElement(
        'div',
        null,
        upcoming.length > 0 && _react2.default.createElement(_items_list.ItemsList, {
          label: 'Upcoming Events',
          model: 'events',
          layout: 'grid',
          list: upcoming
        }),
        past.length > 0 && _react2.default.createElement(_items_list.ItemsList, {
          label: 'Past Events',
          model: 'events',
          list: past,
          layout: 'table',
          canToggle: true
        })
      );
    }
  }]);
  return Events;
}(_react.Component);

Events.propTypes = {
  items: _propTypes2.default.array
};

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SocialContainer = exports.Info = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _item = __webpack_require__(51);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Info = exports.Info = function Info(props) {
  var page = props.page;
  // const cover_image = images && images[0]

  return _react2.default.createElement(
    _react2.default.Fragment,
    null,
    _react2.default.createElement(_item.Item, {
      item: page,
      label: page.title,
      labelLink: true,
      model: 'page',
      editing: false
    })
  )
  //   {/* <SocialContainer>
  //     <Social social={social} />
  //   </SocialContainer> */}
  ;
};
// import { Social } from 'client/components/social/social_list'
var SocialContainer = exports.SocialContainer = _styledComponents2.default.div.withConfig({
  displayName: 'Info__SocialContainer',
  componentId: 'sc-5dppro-0'
})(['font-size:90%;padding:1em 0 4em;']);

Info.propTypes = {
  page: _propTypes2.default.object
};

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Page = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _reactRedux = __webpack_require__(14);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _ErrorBoundary = __webpack_require__(23);

var _page = __webpack_require__(26);

var pageActions = _interopRequireWildcard(_page);

var _loading = __webpack_require__(24);

var _Home = __webpack_require__(80);

var _Info = __webpack_require__(84);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Page = exports.Page = function (_Component) {
  (0, _inherits3.default)(Page, _Component);

  function Page(props) {
    (0, _classCallCheck3.default)(this, Page);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Page.__proto__ || (0, _getPrototypeOf2.default)(Page)).call(this, props));

    _this.fetchPage = function () {
      var _this$props = _this.props,
          fetchPageAction = _this$props.fetchPageAction,
          path = _this$props.match.path;


      fetchPageAction(path);
    };

    _this.getApp = function (page) {
      var path = _this.props.match.path;


      switch (path) {
        case '/':
          {
            return _react2.default.createElement(_Home.Home, { page: page });
          }
        case '/info':
          {
            return _react2.default.createElement(_Info.Info, { page: page });
          }
        default:
          {
            return _react2.default.createElement(_Info.Info, { page: page });
          }
      }
    };

    var data = void 0;
    if (false) {
      data = window.__INITIAL_DATA__;
      delete window.__INITIAL_DATA__;
    } else {
      data = props.staticContext.data;
    }
    _this.state = { data: data };
    return _this;
  }

  (0, _createClass3.default)(Page, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      var _props = this.props,
          page = _props.page,
          loading = _props.loading;


      if ((!page || page && !page._id) && !loading) {
        this.fetchPage();
      }
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(prevProps) {
      var path = this.props.match.path;


      if (prevProps.match.path !== path) {
        this.fetchPage();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var data = this.state.data;
      var error = this.props.error;

      var page = data && data || this.props.page;
      debugger;
      if (!page || page && !page._id || this.props.loading) {
        return _react2.default.createElement(_loading.Loading, null);
      } else {
        return _react2.default.createElement(
          _ErrorBoundary.ErrorBoundary,
          { error: error },
          this.getApp(page)
        );
      }
    }
  }]);
  return Page;
}(_react.Component);

Page.propTypes = {
  error: _propTypes2.default.object,
  fetchPageAction: _propTypes2.default.func,
  page: _propTypes2.default.object,
  loading: _propTypes2.default.bool,
  match: _propTypes2.default.any,
  staticContext: _propTypes2.default.any
};


var mapStateToProps = function mapStateToProps(_ref) {
  var pageReducer = _ref.pageReducer;
  return {
    error: pageReducer.error,
    page: pageReducer.page,
    loading: pageReducer.loading
  };
};

var mapDispatchToProps = {
  fetchPageAction: pageActions.fetchPage
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Page);

/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Projects = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _items_list = __webpack_require__(35);

var _column = __webpack_require__(16);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Projects = exports.Projects = function (_Component) {
  (0, _inherits3.default)(Projects, _Component);

  function Projects() {
    (0, _classCallCheck3.default)(this, Projects);
    return (0, _possibleConstructorReturn3.default)(this, (Projects.__proto__ || (0, _getPrototypeOf2.default)(Projects)).apply(this, arguments));
  }

  (0, _createClass3.default)(Projects, [{
    key: 'render',
    value: function render() {
      var items = this.props.items;


      return _react2.default.createElement(
        _column.LayoutColumn,
        { label: 'Projects' },
        _react2.default.createElement(_items_list.ItemsList, {
          model: 'projects',
          list: items || []
        })
      );
    }
  }]);
  return Projects;
}(_react.Component);

Projects.propTypes = {
  items: _propTypes2.default.array
};

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Publications = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _lodash = __webpack_require__(8);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _items_list = __webpack_require__(35);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Publications = exports.Publications = function (_Component) {
  (0, _inherits3.default)(Publications, _Component);

  function Publications() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Publications);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Publications.__proto__ || (0, _getPrototypeOf2.default)(Publications)).call.apply(_ref, [this].concat(args))), _this), _this.getReleases = function (type) {
      var items = _this.props.items;

      var releases = [];

      items.map(function (item) {
        var sorted = void 0;
        switch (type) {
          case 'compilation':
            {
              sorted = (0, _lodash.filter)(item.formats, { compilation: true });
              break;
            }
          case 'featuring':
            {
              sorted = (0, _lodash.filter)(item.formats, { featuring: true });
              break;
            }
          default:
            {
              sorted = (0, _lodash.filter)(item.formats, { compilation: false, featuring: false });
            }
        }
        // let isRelease = !item.formats.length && !compilation && !featured
        // const isCompilation = filter(item.formats, { compilation: compilation })

        if (sorted.length) {
          releases.push(item);
        }
      });

      var sortedReleases = (0, _lodash.sortBy)(releases, [function (item) {
        if (item.formats.length) {
          return item.formats[0].release_year;
        }
      }, 'name']).reverse();

      return sortedReleases;
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Publications, [{
    key: 'render',
    value: function render() {
      var releases = this.getReleases();
      var compilations = this.getReleases('compilation');
      var featuring = this.getReleases('featuring');

      return _react2.default.createElement(
        'div',
        null,
        releases.length > 0 && _react2.default.createElement(_items_list.ItemsList, {
          model: 'releases',
          list: releases,
          label: 'Releases',
          layout: 'table',
          canToggle: true
        }),
        compilations.length > 0 && _react2.default.createElement(
          Compilations,
          null,
          _react2.default.createElement(_items_list.ItemsList, {
            model: 'releases',
            list: compilations,
            label: 'Compilations',
            layout: 'table',
            canToggle: true
          })
        ),
        featuring.length > 0 && _react2.default.createElement(
          Compilations,
          null,
          _react2.default.createElement(_items_list.ItemsList, {
            model: 'releases',
            list: featuring,
            label: 'Featured Artist',
            layout: 'table',
            canToggle: true
          })
        )
      );
    }
  }]);
  return Publications;
}(_react.Component);

Publications.propTypes = {
  items: _propTypes2.default.array
};


var Compilations = _styledComponents2.default.div.withConfig({
  displayName: 'Publications__Compilations',
  componentId: 'sm4lz-0'
})(['margin-top:5em;']);

/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Login = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRedux = __webpack_require__(14);

var _user = __webpack_require__(44);

var _button = __webpack_require__(9);

var _forms = __webpack_require__(27);

var _column = __webpack_require__(16);

var _loading = __webpack_require__(24);

var _ErrorBoundary = __webpack_require__(23);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Login = exports.Login = function (_Component) {
  (0, _inherits3.default)(Login, _Component);

  function Login() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Login);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Login.__proto__ || (0, _getPrototypeOf2.default)(Login)).call.apply(_ref, [this].concat(args))), _this), _this.onSubmit = function () {
      var loginUserAction = _this.props.loginUserAction;

      if (_this.email && _this.password) {
        var creds = {
          email: _this.email.value,
          password: _this.password.value
        };
        loginUserAction(creds);
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Login, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          error = _props.error,
          loading = _props.loading;


      return _react2.default.createElement(
        _column.LayoutColumn,
        { label: 'Log In' },
        loading ? _react2.default.createElement(_loading.Loading, null) : _react2.default.createElement(
          _ErrorBoundary.ErrorBoundary,
          null,
          _react2.default.createElement(
            _forms.ColumnForm,
            { onSubmit: this.onSubmit },
            _react2.default.createElement(_forms.Input, {
              innerRef: function innerRef(email) {
                return _this2.email = email;
              },
              placeholder: 'email',
              required: true
            }),
            _react2.default.createElement(_forms.Input, {
              innerRef: function innerRef(password) {
                return _this2.password = password;
              },
              placeholder: 'password',
              type: 'password',
              required: true
            }),
            error && _react2.default.createElement(
              _forms.ErrorContainer,
              null,
              error
            ),
            _react2.default.createElement(
              _button.Button,
              { onClick: this.onSubmit },
              'Submit'
            )
          )
        )
      );
    }
  }]);
  return Login;
}(_react.Component);

Login.propTypes = {
  error: _propTypes2.default.string,
  loading: _propTypes2.default.bool,
  loginUserAction: _propTypes2.default.func
};


var mapStateToProps = function mapStateToProps(state) {
  return {
    error: state.user.error,
    loading: state.user.loading,
    user: state.user
  };
};

var mapDispatchToProps = {
  loginUserAction: _user.loginUser
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Login);

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AdminNav = undefined;

var _regenerator = __webpack_require__(37);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = __webpack_require__(36);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _reactRedux = __webpack_require__(14);

var _reactRouter = __webpack_require__(60);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _items = __webpack_require__(22);

var _user = __webpack_require__(44);

var _button = __webpack_require__(9);

var _text = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AdminNav = exports.AdminNav = function (_React$Component) {
  (0, _inherits3.default)(AdminNav, _React$Component);

  function AdminNav() {
    var _ref,
        _this2 = this;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, AdminNav);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = AdminNav.__proto__ || (0, _getPrototypeOf2.default)(AdminNav)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      menuIsOpen: false
    }, _this.toggleNewItemMenu = function (menuIsOpen) {
      _this.setState({ menuIsOpen: menuIsOpen });
    }, _this.newItem = function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(model) {
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return _this.props.createItemAction(model);

              case 3:
                _context.next = 8;
                break;

              case 5:
                _context.prev = 5;
                _context.t0 = _context['catch'](0);

                console.log(_context.t0);

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2, [[0, 5]]);
      }));

      return function (_x) {
        return _ref2.apply(this, arguments);
      };
    }(), _this.newItemMenu = function () {
      return _react2.default.createElement(
        NewItemMenu,
        null,
        _react2.default.createElement(
          NewItemInner,
          null,
          _react2.default.createElement(
            NewItemHeader,
            null,
            _react2.default.createElement(
              _text.H2,
              null,
              'Create a new ...'
            )
          ),
          _react2.default.createElement(
            NewItemContainer,
            null,
            _react2.default.createElement(
              _text.H3,
              null,
              _react2.default.createElement(
                'a',
                { onClick: function onClick() {
                    return _this.newItem('events');
                  } },
                'Event'
              )
            ),
            _react2.default.createElement(
              _text.H3,
              null,
              _react2.default.createElement(
                'a',
                { onClick: function onClick() {
                    return _this.newItem('projects');
                  } },
                'Project'
              )
            ),
            _react2.default.createElement(
              _text.H3,
              null,
              _react2.default.createElement(
                'a',
                { onClick: function onClick() {
                    return _this.newItem('publications');
                  } },
                'Release'
              )
            )
          )
        ),
        _react2.default.createElement(_button.Button, { icon: 'times', borderless: true, onClick: function onClick() {
            return _this.toggleNewItemMenu(false);
          } })
      );
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(AdminNav, [{
    key: 'render',
    value: function render() {
      var _this3 = this;

      var logoutUserAction = this.props.logoutUserAction;
      var menuIsOpen = this.state.menuIsOpen;


      return _react2.default.createElement(
        AdminNavContainer,
        null,
        _react2.default.createElement(_button.Button, { text: 'New', icon: 'file', onClick: function onClick() {
            return _this3.toggleNewItemMenu(true);
          } }),
        _react2.default.createElement(
          'a',
          { onClick: logoutUserAction },
          'Logout'
        ),
        menuIsOpen && this.newItemMenu()
      );
    }
  }]);
  return AdminNav;
}(_react2.default.Component);

AdminNav.propTypes = {
  createItemAction: _propTypes2.default.func,
  logoutUserAction: _propTypes2.default.func
};


var mapStateToProps = function mapStateToProps(state) {
  return {
    isAuthenticated: state.user.isAuthenticated
  };
};

var mapDispatchToProps = {
  logoutUserAction: _user.logoutUser,
  createItemAction: _items.createItem
};

exports.default = (0, _reactRouter.withRouter)((0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(AdminNav));


var AdminNavContainer = _styledComponents2.default.div.withConfig({
  displayName: 'AdminNav__AdminNavContainer',
  componentId: 'sc-1v8k64h-0'
})(['a{cursor:pointer;padding-left:15px;}']);

var NewItemMenu = _styledComponents2.default.div.withConfig({
  displayName: 'AdminNav__NewItemMenu',
  componentId: 'sc-1v8k64h-1'
})(['position:fixed;left:20px;right:20px;top:15px;bottom:15px;z-index:1;padding:20px;border:1px solid;background:white;display:flex;', '{position:absolute;top:10px;right:10px;font-size:1.5em;}'], _button.ButtonContainer);

var NewItemHeader = _styledComponents2.default.div.withConfig({
  displayName: 'AdminNav__NewItemHeader',
  componentId: 'sc-1v8k64h-2'
})(['flex:1;']);

var NewItemContainer = _styledComponents2.default.div.withConfig({
  displayName: 'AdminNav__NewItemContainer',
  componentId: 'sc-1v8k64h-3'
})(['flex:2;margin-top:.45em;', '{a{padding-left:0;&:hover{border-bottom:2px solid;}}}'], _text.H3);

var NewItemInner = _styledComponents2.default.div.withConfig({
  displayName: 'AdminNav__NewItemInner',
  componentId: 'sc-1v8k64h-4'
})(['display:flex;max-width 700px;margin:auto;width:100%;']);

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Nav = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _underscore = __webpack_require__(31);

var _reactRedux = __webpack_require__(14);

var _lodash = __webpack_require__(8);

var _reactRouter = __webpack_require__(60);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactWaypoint = __webpack_require__(145);

var _reactWaypoint2 = _interopRequireDefault(_reactWaypoint);

var _reactRouterDom = __webpack_require__(30);

var _items = __webpack_require__(22);

var _page = __webpack_require__(26);

var _AdminNav = __webpack_require__(89);

var _AdminNav2 = _interopRequireDefault(_AdminNav);

var _text = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PAGE_TITLE = "Eve Essex";


var links = ['events', 'projects', 'releases', 'info'];

var Nav = exports.Nav = function (_React$Component) {
  (0, _inherits3.default)(Nav, _React$Component);

  function Nav() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Nav);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Nav.__proto__ || (0, _getPrototypeOf2.default)(Nav)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      navOpen: false,
      scrollPosition: 0,
      scrollDir: null
    }, _this.componentDidMount = function () {
      var debouncedOnScroll = (0, _lodash.debounce)(_this.onScroll, 5);

      if (false) {
        var scrollPosition = window.pageYOffset;

        _this.setState({ scrollPosition: scrollPosition });
        window.addEventListener('scroll', function () {
          debouncedOnScroll();
        });
      }
    }, _this.onScroll = function () {
      if (false) {
        var scrollPosition = _this.state.scrollPosition;

        var offset = window.pageYOffset;
        var scrollDir = null;

        if (offset !== scrollPosition) {
          if (offset < scrollPosition) {
            scrollDir = 'up';
          }
          _this.setState({
            scrollPosition: offset,
            scrollDir: scrollDir
          });
        }
      }
    }, _this.onClick = function (param) {
      var linkIsActive = _this.linkIsActive(param);

      if (!linkIsActive) {
        // if (param === 'info') {
        //   this.props.resetPageAction()
        // } else {
        _this.props.resetItemsAction();
        // }
      }
    }, _this.linkIsActive = function (param) {
      var pathname = _this.props.location.pathname;

      var isActive = pathname.replace('/', '') === param;

      return isActive;
    }, _this.hasAdminNav = function () {
      var pathname = _this.props.location.pathname;

      var isHome = pathname === '/';
      var isItemsLink = links.includes(pathname.replace('/', ''));

      return (isItemsLink || isHome) && pathname !== '/info';
    }, _this.onWaypointEnter = function () {
      var navOpen = _this.state.navOpen;


      if (navOpen) {
        _this.setState({ navOpen: false });
      }
    }, _this.onWaypointLeave = function () {
      var navOpen = _this.state.navOpen;


      if (!navOpen) {
        _this.setState({ navOpen: true });
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Nav, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _state = this.state,
          navOpen = _state.navOpen,
          scrollDir = _state.scrollDir;
      var isAuthenticated = this.props.isAuthenticated;

      var showAdminNav = isAuthenticated && this.hasAdminNav();

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          NavContainer,
          { scrollDir: scrollDir, navOpen: navOpen },
          _react2.default.createElement(
            _text.H1,
            null,
            _react2.default.createElement(
              'a',
              { href: '/' },
              PAGE_TITLE
            )
          ),
          _react2.default.createElement(
            NavItems,
            { isAuthenticated: isAuthenticated },
            _react2.default.createElement(
              MainMenu,
              null,
              links.map(function (param) {
                var linkIsActive = _this2.linkIsActive(param);

                return _react2.default.createElement(
                  NavItem,
                  { linkIsActive: linkIsActive, key: param },
                  _react2.default.createElement(
                    _reactRouterDom.NavLink,
                    {
                      to: '/' + param,
                      onClick: function onClick() {
                        return _this2.onClick(param);
                      }
                    },
                    (0, _underscore.capitalize)(param)
                  )
                );
              })
            ),
            showAdminNav && _react2.default.createElement(_AdminNav2.default, null)
          )
        ),
        _react2.default.createElement(_reactWaypoint2.default, {
          onEnter: this.onWaypointEnter,
          onLeave: this.onWaypointLeave
        })
      );
    }
  }]);
  return Nav;
}(_react2.default.Component);

Nav.propTypes = {
  isAuthenticated: _propTypes2.default.bool,
  resetItemsAction: _propTypes2.default.func,
  // resetPageAction: PropTypes.func,
  location: _propTypes2.default.object
};


var mapStateToProps = function mapStateToProps(state) {
  return {
    isAuthenticated: state.user.isAuthenticated
  };
};

var mapDispatchToProps = {
  resetItemsAction: _items.resetItems,
  resetPageAction: _page.resetPage
};

exports.default = (0, _reactRouter.withRouter)((0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Nav));


var NavContainer = _styledComponents2.default.div.withConfig({
  displayName: 'Nav__NavContainer',
  componentId: 'ydxrwa-0'
})(['padding:10px 20px;display:flex;align-items:center;justify-content:space-between;a{text-decoration:none;}', '{font-size:1.5em;font-weight:600;line-height:1em;text-transform:uppercase;letter-spacing:.075em;}', ''], _text.H1, function (props) {
  return props.navOpen && '\n    position: fixed;\n    left: 0;\n    right: 0;\n    top: 0;\n    background: white;\n    z-index: 10;\n    border-bottom: 1px solid #ddd;\n  ';
});

var MainMenu = _styledComponents2.default.div.withConfig({
  displayName: 'Nav__MainMenu',
  componentId: 'ydxrwa-1'
})(['list-style:none;display:flex;margin-block-start:0;padding-inline-start:0;']);

var NavItems = _styledComponents2.default.div.withConfig({
  displayName: 'Nav__NavItems',
  componentId: 'ydxrwa-2'
})(['display:flex;justify-content:space-between;align-items:center;', ''], function (props) {
  return props.isAuthenticated && '\n    flex: 1;\n  ';
});

var NavItem = _styledComponents2.default.div.withConfig({
  displayName: 'Nav__NavItem',
  componentId: 'ydxrwa-3'
})(['padding-left:15px;', ''], function (props) {
  return props.linkIsActive && '\n    a {\n      border-bottom: 2px solid;\n      font-weight: 600;\n    }\n  ';
});

/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatesEdit = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactStyledFlexboxgrid = __webpack_require__(15);

var _checkbox_input = __webpack_require__(46);

var _date_input = __webpack_require__(100);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DatesEdit = exports.DatesEdit = function (_Component) {
  (0, _inherits3.default)(DatesEdit, _Component);

  function DatesEdit() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, DatesEdit);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = DatesEdit.__proto__ || (0, _getPrototypeOf2.default)(DatesEdit)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      allDay: _this.props.all_day === true,
      hasEndDate: _this.props.end_date !== null
    }, _this.toggleAllDay = function () {
      var all_day = _this.state.all_day;
      var onChange = _this.props.onChange;


      onChange('all_day', !all_day);
      _this.setState({ all_day: !all_day });
    }, _this.toggleEndDate = function () {
      var hasEndDate = _this.state.hasEndDate;
      var onChange = _this.props.onChange;


      if (hasEndDate) {
        onChange('end_date', null);
      }
      _this.setState({ hasEndDate: !hasEndDate });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(DatesEdit, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          all_day = _props.all_day,
          end_date = _props.end_date,
          _onChange = _props.onChange,
          start_date = _props.start_date;
      var hasEndDate = this.state.hasEndDate;


      return _react2.default.createElement(
        DatesEditContainer,
        null,
        _react2.default.createElement(
          _reactStyledFlexboxgrid.Row,
          null,
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            null,
            _react2.default.createElement(_date_input.DateInput, {
              label: 'Start Date',
              value: start_date || new Date(),
              required: true,
              allDay: all_day,
              onChange: function onChange(date) {
                return _onChange('start_date', date);
              },
              autoFocus: true
            })
          ),
          hasEndDate && _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            null,
            _react2.default.createElement(_date_input.DateInput, {
              label: 'End Date',
              value: end_date || null,
              allDay: all_day,
              onChange: function onChange(date) {
                return _onChange('end_date', date);
              }
            })
          )
        ),
        _react2.default.createElement(
          _reactStyledFlexboxgrid.Row,
          null,
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            null,
            _react2.default.createElement(_checkbox_input.CheckboxInput, {
              label: 'Hide End Date',
              name: 'end_date',
              value: !hasEndDate,
              onChange: this.toggleEndDate
            })
          ),
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            null,
            _react2.default.createElement(_checkbox_input.CheckboxInput, {
              label: 'Hide Time',
              name: 'all_day',
              value: all_day,
              onChange: function onChange() {
                return _onChange('all_day', !all_day);
              }
            })
          )
        )
      );
    }
  }]);
  return DatesEdit;
}(_react.Component);

DatesEdit.propTypes = {
  all_day: _propTypes2.default.bool,
  end_date: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  start_date: _propTypes2.default.string
};


var DatesEditContainer = _styledComponents2.default.div.withConfig({
  displayName: 'dates_edit__DatesEditContainer',
  componentId: 'sc-6cxdq-0'
})(['', '{padding-bottom:10px;', '{&:first-child{padding-left:0;}&:last-child{padding-right:0;}}}input{border:none;border-bottom:1px solid #ddd;font-size:.9em;padding-bottom:2px;font-family:inherit;}'], _reactStyledFlexboxgrid.Row, _reactStyledFlexboxgrid.Col);

/***/ }),
/* 92 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DatesModal = undefined;

var _extends2 = __webpack_require__(19);

var _extends3 = _interopRequireDefault(_extends2);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _modal = __webpack_require__(18);

var _dates_edit = __webpack_require__(91);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DatesModal = exports.DatesModal = function DatesModal(props) {
  var all_day = props.all_day,
      end_date = props.end_date,
      onChange = props.onChange,
      setEditing = props.setEditing,
      start_date = props.start_date;


  var dateProps = {
    all_day: all_day,
    end_date: end_date,
    start_date: start_date
  };

  return _react2.default.createElement(
    _modal.Modal,
    { onClick: function onClick() {
        return setEditing(null);
      } },
    _react2.default.createElement(_dates_edit.DatesEdit, (0, _extends3.default)({}, dateProps, {
      onChange: onChange
    }))
  );
};

DatesModal.propTypes = {
  all_day: _propTypes2.default.bool,
  end_date: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  setEditing: _propTypes2.default.func,
  start_date: _propTypes2.default.string
};

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmbedContainer = exports.Embed = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Embed = exports.Embed = function Embed(props) {
  var embed_code = props.embed_code;


  return _react2.default.createElement(EmbedContainer, {
    dangerouslySetInnerHTML: { __html: embed_code }
  });
};

Embed.propTypes = {
  embed_code: _propTypes2.default.string
};

var EmbedContainer = exports.EmbedContainer = _styledComponents2.default.div.withConfig({
  displayName: 'embed__EmbedContainer',
  componentId: 'sc-7y0vux-0'
})(['iframe{width:100%;}']);

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EmbedModal = undefined;

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _embed_list = __webpack_require__(32);

var _modal = __webpack_require__(18);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EmbedModal = exports.EmbedModal = function EmbedModal(props) {
  var embed_codes = props.embed_codes,
      onChange = props.onChange,
      setEditing = props.setEditing;


  return _react2.default.createElement(
    _modal.Modal,
    { onClick: function onClick() {
        return setEditing(null);
      } },
    _react2.default.createElement(
      'label',
      null,
      'Embeds'
    ),
    _react2.default.createElement(_embed_list.EmbedList, {
      editing: true,
      embed_codes: embed_codes,
      hasNew: true,
      onChange: onChange
    })
  );
};

EmbedModal.propTypes = {
  embed_codes: _propTypes2.default.array,
  onChange: _propTypes2.default.func,
  setEditing: _propTypes2.default.func
};

/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormatContainer = exports.Format = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Format = exports.Format = function Format(props) {
  var item = props.item,
      short = props.short,
      onClick = props.onClick;
  var format = item.format,
      publisher = item.publisher,
      release_year = item.release_year;


  var formattedFormat = format && (publisher || release_year && !short) ? format + ', ' : format;
  var formattedPublisher = release_year && !short ? publisher + ', ' : publisher;

  return _react2.default.createElement(
    FormatContainer,
    {
      onClick: onClick && onClick,
      short: short
    },
    formattedFormat,
    publisher && formattedPublisher,
    !short && release_year
  );
};

var FormatContainer = exports.FormatContainer = _styledComponents2.default.div.withConfig({
  displayName: 'format__FormatContainer',
  componentId: 'ze9pdj-0'
})(['margin-bottom:.35em;', ''], function (props) {
  return props.short && '\n    margin-bottom: 0;\n  ';
});

Format.propTypes = {
  item: _propTypes2.default.object,
  short: _propTypes2.default.bool,
  onClick: _propTypes2.default.func
};

/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormatEdit = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactStyledFlexboxgrid = __webpack_require__(15);

var _button = __webpack_require__(9);

var _checkbox_input = __webpack_require__(46);

var _select_input = __webpack_require__(49);

var _forms = __webpack_require__(27);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FormatEdit = exports.FormatEdit = function (_Component) {
  (0, _inherits3.default)(FormatEdit, _Component);

  function FormatEdit(props) {
    (0, _classCallCheck3.default)(this, FormatEdit);

    var _this = (0, _possibleConstructorReturn3.default)(this, (FormatEdit.__proto__ || (0, _getPrototypeOf2.default)(FormatEdit)).call(this, props));

    _this.onChangeFormat = function (key, value) {
      var item = _this.props.item;

      var needsSave = true;

      item[key] = value;
      _this.setState({ item: item, needsSave: needsSave });
    };

    _this.saveItem = function () {
      var _this$props = _this.props,
          index = _this$props.index,
          onChange = _this$props.onChange;
      var item = _this.state.item;

      var needsSave = false;

      _this.setState({ needsSave: needsSave });
      onChange(item, index);
    };

    var _props$item = props.item,
        compilation = _props$item.compilation,
        featuring = _props$item.featuring,
        format = _props$item.format,
        publisher = _props$item.publisher,
        release_year = _props$item.release_year;


    _this.state = {
      item: {
        compilation: compilation || false,
        featuring: featuring || false,
        format: format || '',
        publisher: publisher || '',
        release_year: release_year || null
      },
      needsSave: false
    };
    return _this;
  }

  (0, _createClass3.default)(FormatEdit, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _state = this.state,
          item = _state.item,
          needsSave = _state.needsSave;
      var _props = this.props,
          onRemoveFormat = _props.onRemoveFormat,
          index = _props.index;
      var compilation = item.compilation,
          featuring = item.featuring,
          format = item.format,
          publisher = item.publisher,
          release_year = item.release_year;


      return _react2.default.createElement(
        FormatEditContainer,
        null,
        _react2.default.createElement(
          _reactStyledFlexboxgrid.Row,
          null,
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            null,
            _react2.default.createElement(_select_input.SelectInput, {
              name: 'format',
              value: format,
              options: ['LP', '2xLP', 'Cassette', '2xCassette', 'CD', '2xCD', 'Digital'],
              onChange: function onChange(key, value) {
                return _this2.onChangeFormat(key, value);
              }
            })
          ),
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            null,
            _react2.default.createElement(_forms.Input, {
              placeholder: 'YYYY',
              maxLength: '4',
              name: 'release_year',
              defaultValue: release_year,
              onChange: function onChange(e) {
                _this2.onChangeFormat('release_year', parseInt(e.target.value));
              }
            })
          ),
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            null,
            _react2.default.createElement(_forms.Input, {
              placeholder: 'publisher',
              defaultValue: publisher,
              onChange: function onChange(e) {
                return _this2.onChangeFormat('publisher', e.target.value);
              }
            })
          ),
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            null,
            _react2.default.createElement(_checkbox_input.CheckboxInput, {
              label: 'Compilation',
              value: compilation,
              onChange: function onChange() {
                return _this2.onChangeFormat('compilation', !compilation);
              }
            })
          ),
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            null,
            _react2.default.createElement(_checkbox_input.CheckboxInput, {
              label: 'Featuring',
              value: featuring,
              onChange: function onChange() {
                return _this2.onChangeFormat('featuring', !featuring);
              }
            })
          ),
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            null,
            _react2.default.createElement(
              _button.Button,
              {
                color: needsSave ? 'red' : 'black',
                onClick: this.saveItem
              },
              'Save'
            ),
            onRemoveFormat && _react2.default.createElement(_button.Button, {
              borderless: true,
              icon: 'ban',
              onClick: function onClick() {
                return onRemoveFormat(index);
              }
            })
          )
        )
      );
    }
  }]);
  return FormatEdit;
}(_react.Component);

FormatEdit.propTypes = {
  index: _propTypes2.default.number,
  item: _propTypes2.default.object.isRequired,
  onChange: _propTypes2.default.func.isRequired,
  onRemoveFormat: _propTypes2.default.func
};


var FormatEditContainer = _styledComponents2.default.div.withConfig({
  displayName: 'format_edit__FormatEditContainer',
  componentId: 'digwo6-0'
})(['', '{margin:0;padding:0 0 10px 0;flex-wrap:nowrap;}', '{padding-left:0 !important;padding-right:10px !important;}input[name=\'release_year\']{width:3em;}'], _reactStyledFlexboxgrid.Row, _reactStyledFlexboxgrid.Col);

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormatsEdit = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _button = __webpack_require__(9);

var _format_edit = __webpack_require__(96);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FormatsEdit = exports.FormatsEdit = function (_Component) {
  (0, _inherits3.default)(FormatsEdit, _Component);

  function FormatsEdit() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, FormatsEdit);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = FormatsEdit.__proto__ || (0, _getPrototypeOf2.default)(FormatsEdit)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      showNewForm: _this.props.formats.length === 0

      // TODO: Remove format

    }, _this.onChangeFormat = function (item, index) {
      var _this$props = _this.props,
          onChange = _this$props.onChange,
          formats = _this$props.formats;


      formats[index] = item;
      onChange('formats', formats);
    }, _this.onNewFormat = function (item) {
      var _this$props2 = _this.props,
          onChange = _this$props2.onChange,
          formats = _this$props2.formats;


      formats.push(item);
      onChange('formats', formats);
      _this.setState({ showNewForm: false });
    }, _this.onRemoveFormat = function (index) {
      var _this$props3 = _this.props,
          onChange = _this$props3.onChange,
          formats = _this$props3.formats;

      formats.splice(index, 1);

      onChange('formats', formats);
      _this.setState({ showNewForm: false });
    }, _this.renderNew = function () {
      var showNewForm = _this.state.showNewForm;


      if (showNewForm) {
        return _react2.default.createElement(_format_edit.FormatEdit, { onChange: _this.onNewFormat, item: {} });
      } else {
        return _react2.default.createElement(_button.Button, {
          text: 'Add New',
          icon: 'plus',
          onClick: function onClick() {
            return _this.setState({ showNewForm: true });
          }
        });
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(FormatsEdit, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var formats = this.props.formats;


      return _react2.default.createElement(
        'div',
        null,
        formats.map(function (format, index) {
          return _react2.default.createElement(_format_edit.FormatEdit, {
            index: index,
            item: format,
            key: index,
            onChange: _this2.onChangeFormat,
            onRemoveFormat: _this2.onRemoveFormat
          });
        }),
        this.renderNew()
      );
    }
  }]);
  return FormatsEdit;
}(_react.Component);

FormatsEdit.propTypes = {
  formats: _propTypes2.default.array.isRequired,
  onChange: _propTypes2.default.func.isRequired
};


FormatsEdit.propTypes = {
  formats: _propTypes2.default.array.isRequired,
  onChange: _propTypes2.default.func.isRequired
};

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormatsModal = undefined;

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _modal = __webpack_require__(18);

var _formats_edit = __webpack_require__(97);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FormatsModal = exports.FormatsModal = function FormatsModal(props) {
  var setEditing = props.setEditing;


  return _react2.default.createElement(
    _modal.Modal,
    { onClick: function onClick() {
        return setEditing(null);
      } },
    _react2.default.createElement(
      'label',
      null,
      'Formats:'
    ),
    _react2.default.createElement(_formats_edit.FormatsEdit, props)
  );
};

FormatsModal.propTypes = {
  setEditing: _propTypes2.default.func.isRequired
};

/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SaveButton = undefined;

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _button = __webpack_require__(9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SaveButton = exports.SaveButton = function SaveButton(props) {
  var isSaved = props.isSaved,
      isSaving = props.isSaving,
      onClick = props.onClick;

  var action = isSaving ? 'Saving' : 'Save';

  return _react2.default.createElement(
    _button.ButtonContainer,
    {
      'data-saving': isSaving,
      'data-saved': isSaved,
      onClick: onClick,
      color: textColor(!isSaved, isSaving)
    },
    action
  );
};

function textColor(needsSave, isSaving) {
  if (isSaving) {
    return 'limegreen';
  } else if (needsSave) {
    return 'red';
  } else {
    return 'black';
  }
}

SaveButton.propTypes = {
  isSaved: _propTypes2.default.bool,
  isSaving: _propTypes2.default.bool,
  onClick: _propTypes2.default.func.isRequired
};

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DateInput = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _moment = __webpack_require__(59);

var _moment2 = _interopRequireDefault(_moment);

var _forms = __webpack_require__(27);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DateInput = exports.DateInput = function (_Component) {
  (0, _inherits3.default)(DateInput, _Component);

  function DateInput() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, DateInput);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = DateInput.__proto__ || (0, _getPrototypeOf2.default)(DateInput)).call.apply(_ref, [this].concat(args))), _this), _this.onKeyUp = function () {
      var onChange = _this.props.onChange;

      if (_this.date && _this.time) {
        var newDate = _this.date.value;
        var newTime = _this.time.value || '';
        // TODO: Investigate local
        var formattedDate = (0, _moment2.default)(newDate + ' ' + newTime).toISOString();

        onChange(formattedDate);
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(DateInput, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          autoFocus = _props.autoFocus,
          allDay = _props.allDay,
          label = _props.label,
          value = _props.value,
          required = _props.required;


      return _react2.default.createElement(
        'div',
        null,
        label && _react2.default.createElement(
          Label,
          { required: required },
          label
        ),
        _react2.default.createElement(_forms.Input, {
          type: 'date',
          innerRef: function innerRef(ref) {
            _this2.date = ref;
          },
          required: required || false,
          defaultValue: (0, _moment2.default)(value).format('YYYY-MM-DD'),
          onKeyUp: this.onKeyUp,
          autoFocus: autoFocus
        }),
        !allDay && _react2.default.createElement(_forms.Input, {
          type: 'time',
          innerRef: function innerRef(ref) {
            _this2.time = ref;
          },
          defaultValue: (0, _moment2.default)(value).format('HH:mm'),
          onKeyUp: this.onKeyUp
        })
      );
    }
  }]);
  return DateInput;
}(_react.Component);

DateInput.propTypes = {
  autoFocus: _propTypes2.default.bool,
  allDay: _propTypes2.default.bool,
  label: _propTypes2.default.string,
  required: _propTypes2.default.bool,
  onChange: _propTypes2.default.func,
  value: _propTypes2.default.any
};


var Label = _styledComponents2.default.label.withConfig({
  displayName: 'date_input__Label',
  componentId: 'sc-1o782dn-0'
})(['', ''], function (props) {
  return props.required && '\n    &::after {\n      content: \'*\';\n      color: red;\n      margin-left: 5px;\n      font-size: .75em;\n      vertical-align: super;\n      position: absolute;\n    }\n  ';
});

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DragZone = exports.FileInput = undefined;

var _regenerator = __webpack_require__(37);

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = __webpack_require__(36);

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _axios = __webpack_require__(58);

var _axios2 = _interopRequireDefault(_axios);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _button = __webpack_require__(9);

var _text = __webpack_require__(10);

var _loading = __webpack_require__(24);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FileInput = exports.FileInput = function (_Component) {
  (0, _inherits3.default)(FileInput, _Component);

  function FileInput() {
    var _ref,
        _this2 = this;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, FileInput);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = FileInput.__proto__ || (0, _getPrototypeOf2.default)(FileInput)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      isDragOver: false,
      loading: false
    }, _this.onChangeImage = function (newImage) {
      var _this$props = _this.props,
          onChange = _this$props.onChange,
          hasPreview = _this$props.hasPreview;


      onChange(newImage);
      _this.setState({
        loading: false,
        fileUrl: !hasPreview && ''
      });
    }, _this.uploadFile = function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data, signature) {
        var _ref3, signedRequest, url;

        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return signature.data;

              case 3:
                _ref3 = _context.sent;
                signedRequest = _ref3.signedRequest;
                url = _ref3.url;

                _axios2.default.put(signedRequest, data, {
                  headers: {
                    'Content-Type': data.type
                  },
                  crossDomain: true
                }).then(function () {
                  var img = new Image();
                  img.src = url || '';

                  img.onload = function () {
                    var aspect = img.width / img.height;
                    var newImage = {
                      url: url,
                      aspect: aspect,
                      caption: ''
                    };
                    _this.onChangeImage(newImage);
                    return newImage;
                  };
                }).catch(function (err) {
                  console.error(err);
                });
                _context.next = 12;
                break;

              case 9:
                _context.prev = 9;
                _context.t0 = _context['catch'](0);

                console.error(_context.t0);

              case 12:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2, [[0, 9]]);
      }));

      return function (_x, _x2) {
        return _ref2.apply(this, arguments);
      };
    }(), _this.toggleDragOver = function (isDragOver) {
      _this.setState({ isDragOver: isDragOver });
    }, _this.fetchSignature = function (e) {
      var fetchUpload = _this.props.fetchUpload;
      var _e$target = e.target,
          files = _e$target.files,
          file = _e$target.file;


      fetchUpload(files[0], file, _this.uploadFile.bind(_this));
      _this.setState({ loading: true });
    }, _this.renderPreview = function (file) {
      if (file && file.url) {
        if (file.url.includes('mp4')) {
          return _react2.default.createElement('video', { src: file.url });
        } else {
          return _react2.default.createElement(
            Preview,
            null,
            _react2.default.createElement('img', { src: file.url }),
            _react2.default.createElement(_button.Button, {
              icon: 'times',
              onClick: _this.props.onDelete
            })
          );
        }
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(FileInput, [{
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _props = this.props,
          accept = _props.accept,
          file = _props.file,
          hasPreview = _props.hasPreview,
          label = _props.label;
      var _state = this.state,
          isDragOver = _state.isDragOver,
          loading = _state.loading;


      return _react2.default.createElement(
        FileInputContainer,
        null,
        label && _react2.default.createElement(
          'label',
          null,
          label
        ),
        _react2.default.createElement(
          DragZone,
          {
            'data-drag-over': isDragOver,
            onDragEnter: function onDragEnter() {
              return _this3.toggleDragOver(true);
            },
            onDragLeave: function onDragLeave() {
              return _this3.toggleDragOver(false);
            },
            ref: function ref(div) {
              return _this3.fileContainer = div;
            },
            style: {
              opacity: hasPreview && file.url ? 1 : 0.7,
              borderWidth: hasPreview && file.url ? 0 : '1px'
            }
          },
          hasPreview && this.renderPreview(file),
          _react2.default.createElement(
            Input,
            null,
            loading ? _react2.default.createElement(_loading.Loading, { isAbsolute: true }) : _react2.default.createElement(
              'div',
              null,
              hasPreview && !file.url || !hasPreview && _react2.default.createElement(
                _text.H5,
                null,
                'Click or Drag to Upload'
              ),
              _react2.default.createElement('input', {
                type: 'file',
                accept: accept || 'image/*, video/mp4',
                onChange: this.fetchSignature
              })
            )
          )
        )
      );
    }
  }]);
  return FileInput;
}(_react.Component);

FileInput.propTypes = {
  accept: _propTypes2.default.string,
  fetchUpload: _propTypes2.default.func.isRequired,
  hasPreview: _propTypes2.default.bool,
  label: _propTypes2.default.string,
  onChange: _propTypes2.default.func.isRequired,
  onDelete: _propTypes2.default.func,
  file: _propTypes2.default.object
};
FileInput.defaultProps = {
  file: {
    url: ''
  }
};


var FileInputContainer = _styledComponents2.default.div.withConfig({
  displayName: 'file_input__FileInputContainer',
  componentId: 'sc-1r0jves-0'
})(['position:relative;width:100%;']);

var DragZone = exports.DragZone = _styledComponents2.default.div.withConfig({
  displayName: 'file_input__DragZone',
  componentId: 'sc-1r0jves-1'
})(['width:100%;min-width:100%;height:100%;position:relative;display:flex;align-items:center;justify-content:center;background:#eaeaea;color:#aaa;border:1px dashed #aaa;opacity:.7;transition:opacity .5s;&:hover{opacity:1;}']);

var Input = _styledComponents2.default.div.withConfig({
  displayName: 'file_input__Input',
  componentId: 'sc-1r0jves-2'
})(['min-height:150px;display:flex;align-items:center;justify-content:center;max-height:100%;input{position:absolute;left:0;right:0;top:0;bottom:0;opacity:0;min-width:100%;}']);

var Preview = _styledComponents2.default.div.withConfig({
  displayName: 'file_input__Preview',
  componentId: 'sc-1r0jves-3'
})(['img{max-width:100%;display:block;}button{position:absolute;right:-3px;top:-3px;z-index:10;padding:2px 5px;font-size:1em;&:hover{color:red;}}']);

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _button = __webpack_require__(9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UrlInput = function (_Component) {
  (0, _inherits3.default)(UrlInput, _Component);

  function UrlInput() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, UrlInput);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = UrlInput.__proto__ || (0, _getPrototypeOf2.default)(UrlInput)).call.apply(_ref, [this].concat(args))), _this), _this.onSubmit = function (e) {
      e.preventDefault();
      _this.props.confirmLink(_this.refs.url.value);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(UrlInput, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          name = _props.name,
          url = _props.url;


      return _react2.default.createElement(
        'form',
        { onSubmit: this.onSubmit },
        _react2.default.createElement('input', {
          placeholder: name,
          ref: 'url',
          defaultValue: url || ''
        }),
        _react2.default.createElement(
          _button.Button,
          null,
          'Save'
        )
      );
    }
  }]);
  return UrlInput;
}(_react.Component);

UrlInput.propTypes = {
  confirmLink: _propTypes2.default.func,
  name: _propTypes2.default.string,
  url: _propTypes2.default.string
};
exports.default = UrlInput;

/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decorator = exports.Link = exports.findLinkEntities = undefined;

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _draftJs = __webpack_require__(38);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var findLinkEntities = exports.findLinkEntities = function findLinkEntities(contentBlock, callback, contentState) {
  contentBlock.findEntityRanges(function (character) {
    var entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK';
  }, callback);
};

var Link = exports.Link = function Link(props) {
  var children = props.children,
      contentState = props.contentState,
      entityKey = props.entityKey;

  var _contentState$getEnti = contentState.getEntity(entityKey).getData(),
      url = _contentState$getEnti.url;

  return _react2.default.createElement(
    'a',
    { href: url },
    children
  );
};

Link.propTypes = {
  children: _propTypes2.default.any,
  contentState: _propTypes2.default.any,
  entityKey: _propTypes2.default.string
};

var decorator = exports.decorator = new _draftJs.CompositeDecorator([{
  strategy: findLinkEntities,
  component: Link
}]);

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Nav = exports.EditNav = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _button = __webpack_require__(9);

var _save = __webpack_require__(99);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EditNav = exports.EditNav = function EditNav(props) {
  var deleteItem = props.deleteItem,
      isSaved = props.isSaved,
      isSaving = props.isSaving,
      item = props.item,
      onPublish = props.onPublish,
      saveItem = props.saveItem,
      setEditing = props.setEditing,
      noLinks = props.noLinks;


  return _react2.default.createElement(
    Nav,
    null,
    setEditing && _react2.default.createElement(
      ModalNav,
      null,
      _react2.default.createElement(_button.Button, {
        icon: 'camera',
        onClick: function onClick() {
          return setEditing('images');
        }
      }),
      _react2.default.createElement(_button.Button, {
        icon: 'code',
        onClick: function onClick() {
          return setEditing('embeds');
        }
      }),
      !noLinks && _react2.default.createElement(_button.Button, {
        icon: 'link',
        onClick: function onClick() {
          return setEditing('links');
        }
      })
    ),
    onPublish && _react2.default.createElement(_button.Button, {
      text: item.published ? 'Unpublish' : 'Publish',
      onClick: function onClick() {
        return onPublish('published', !item.published);
      }
    }),
    saveItem && _react2.default.createElement(_save.SaveButton, {
      isSaved: isSaved,
      isSaving: isSaving,
      onClick: function onClick() {
        return saveItem(item, true);
      }
    }),
    deleteItem && _react2.default.createElement(_button.Button, {
      onClick: deleteItem,
      text: 'Delete'
    })
  );
};

var Nav = exports.Nav = _styledComponents2.default.nav.withConfig({
  displayName: 'edit_nav__Nav',
  componentId: 'y2brsd-0'
})(['position:fixed;top:10px;right:20px;z-index:100;align-items:center;display:flex;', '{margin-left:.5em;width:7.5em;}'], _button.ButtonContainer);

var ModalNav = _styledComponents2.default.div.withConfig({
  displayName: 'edit_nav__ModalNav',
  componentId: 'y2brsd-1'
})(['', '{margin-left:.5em;width:inherit;padding:4.5px 10px;.fa{font-size:1.3em;vertical-align:sub;}}'], _button.ButtonContainer);

EditNav.propTypes = {
  deleteItem: _propTypes2.default.func,
  isSaved: _propTypes2.default.bool,
  isSaving: _propTypes2.default.bool,
  item: _propTypes2.default.object,
  noLinks: _propTypes2.default.bool,
  onPublish: _propTypes2.default.func,
  saveItem: _propTypes2.default.func,
  setEditing: _propTypes2.default.func
};

/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImagesEdit = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _image_edit = __webpack_require__(50);

var _modal = __webpack_require__(18);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ImagesEdit = exports.ImagesEdit = function (_Component) {
  (0, _inherits3.default)(ImagesEdit, _Component);

  function ImagesEdit() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, ImagesEdit);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = ImagesEdit.__proto__ || (0, _getPrototypeOf2.default)(ImagesEdit)).call.apply(_ref, [this].concat(args))), _this), _this.onChangeImage = function (image, index) {
      var _this$props = _this.props,
          item = _this$props.item,
          onChange = _this$props.onChange;

      var images = item.images || [];

      images[index] = image;
      onChange(images);
    }, _this.onNewImage = function (image) {
      var _this$props2 = _this.props,
          item = _this$props2.item,
          onChange = _this$props2.onChange;

      var images = item.images || [];

      images.push(image);
      onChange(images);
      _this.forceUpdate();
    }, _this.onDeleteImage = function (index) {
      var _this$props3 = _this.props,
          item = _this$props3.item,
          onChange = _this$props3.onChange;

      var images = item.images || [];

      if (images.length === 1) {
        onChange([]);
      } else {
        images.splice(index, 1);
        onChange(images);
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(ImagesEdit, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          item = _props.item,
          fetchUpload = _props.fetchUpload,
          setEditing = _props.setEditing;

      var images = item.images || [];

      return _react2.default.createElement(
        _modal.Modal,
        { onClick: function onClick() {
            return setEditing(null);
          } },
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'label',
            null,
            'Images'
          ),
          images.length > 0 && _react2.default.createElement(
            ImagesEditList,
            null,
            images.map(function (image, index) {
              return _react2.default.createElement(_image_edit.ImageEdit, {
                index: index,
                item: image,
                key: index,
                onChange: _this2.onChangeImage,
                onDelete: _this2.onDeleteImage,
                editCaption: true
              });
            })
          ),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(_image_edit.ImageEdit, {
              fetchUpload: fetchUpload,
              index: -1,
              item: {},
              onChange: this.onNewImage,
              showInput: true
            })
          )
        )
      );
    }
  }]);
  return ImagesEdit;
}(_react.Component);

ImagesEdit.propTypes = {
  fetchUpload: _propTypes2.default.func.isRequired,
  item: _propTypes2.default.object.isRequired,
  onChange: _propTypes2.default.func.isRequired,
  setEditing: _propTypes2.default.func.isRequired
};


var ImagesEditList = _styledComponents2.default.div.withConfig({
  displayName: 'images_edit__ImagesEditList',
  componentId: 'sc-1jorwxs-0'
})(['display:flex;justify-content:space-around;', '{max-width:35%;padding-bottom:20px;}'], _image_edit.ImageContainer);

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ImagesShow = undefined;

var _extends2 = __webpack_require__(19);

var _extends3 = _interopRequireDefault(_extends2);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _image = __webpack_require__(34);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ImagesShow = exports.ImagesShow = function ImagesShow(props) {
  var images = props.images;


  return _react2.default.createElement(
    'div',
    null,
    images.map(function (image, i) {
      return _react2.default.createElement(_image.Image, (0, _extends3.default)({}, image, { key: i }));
    })
  );
};

ImagesShow.propTypes = {
  images: _propTypes2.default.array
};

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ItemEdit = undefined;

var _extends2 = __webpack_require__(19);

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRedux = __webpack_require__(14);

var _item = __webpack_require__(21);

var itemActions = _interopRequireWildcard(_item);

var _utils = __webpack_require__(25);

var _edit_nav = __webpack_require__(104);

var _column = __webpack_require__(16);

var _grid = __webpack_require__(55);

var _item_edit_modals = __webpack_require__(108);

var _item_edit_modals2 = _interopRequireDefault(_item_edit_modals);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItemEdit = exports.ItemEdit = function (_Component) {
  (0, _inherits3.default)(ItemEdit, _Component);

  function ItemEdit() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, ItemEdit);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = ItemEdit.__proto__ || (0, _getPrototypeOf2.default)(ItemEdit)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      isEditing: null
    }, _this.onChange = function (key, value) {
      var _this$props = _this.props,
          changeItemAction = _this$props.changeItemAction,
          maybeSaveItem = _this$props.maybeSaveItem,
          model = _this$props.model;


      changeItemAction(key, value);
      maybeSaveItem(model);
    }, _this.setEditing = function (isEditing) {
      _this.setState({ isEditing: isEditing });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(ItemEdit, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var isEditing = this.state.isEditing;
      var _props = this.props,
          _deleteItem = _props.deleteItem,
          model = _props.model,
          maybeSaveItem = _props.maybeSaveItem;
      var _props2 = this.props,
          item = _props2.item,
          isSaved = _props2.isSaved,
          isSaving = _props2.isSaving;


      var images = item.images || [];
      var isPublication = model === 'publications';
      var isGrid = images.length !== 0 && ((0, _utils.imageIsVertical)(images[0]) || isPublication);

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_edit_nav.EditNav, {
          deleteItem: function deleteItem() {
            return _deleteItem(model, item);
          },
          isSaved: isSaved,
          isSaving: isSaving,
          item: item,
          model: model,
          setEditing: this.setEditing,
          onPublish: function onPublish() {
            return _this2.onChange('published', !item.published);
          },
          saveItem: function saveItem() {
            return maybeSaveItem(model, true);
          }
        }),
        isGrid || model === 'publications' && images.length ? _react2.default.createElement(_grid.LayoutGrid, (0, _extends3.default)({}, this.props, {
          item: item,
          onChange: this.onChange,
          setEditing: this.setEditing
        })) : _react2.default.createElement(_column.LayoutColumn, (0, _extends3.default)({}, this.props, {
          item: item,
          onChange: this.onChange,
          setEditing: this.setEditing
        })),
        _react2.default.createElement(_item_edit_modals2.default, {
          isEditing: isEditing,
          setEditing: this.setEditing,
          onChange: this.onChange
        })
      );
    }
  }]);
  return ItemEdit;
}(_react.Component);

ItemEdit.propTypes = {
  changeItemAction: _propTypes2.default.func,
  deleteItem: _propTypes2.default.func,
  item: _propTypes2.default.object,
  isSaved: _propTypes2.default.bool,
  isSaving: _propTypes2.default.bool,
  maybeSaveItem: _propTypes2.default.func,
  model: _propTypes2.default.string
};


var mapStateToProps = function mapStateToProps(_ref2) {
  var itemReducer = _ref2.itemReducer;
  return {
    item: itemReducer.item,
    isSaved: itemReducer.isSaved,
    isSaving: itemReducer.isSaving
  };
};

var mapDispatchToProps = {
  changeItemAction: itemActions.changeItem,
  deleteItem: itemActions.deleteItem,
  maybeSaveItem: itemActions.maybeSaveItem
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ItemEdit);

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ItemEditModals = undefined;

var _extends2 = __webpack_require__(19);

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactRedux = __webpack_require__(14);

var _item = __webpack_require__(21);

var itemActions = _interopRequireWildcard(_item);

var _dates_modal = __webpack_require__(92);

var _embed_modal = __webpack_require__(94);

var _formats_modal = __webpack_require__(98);

var _images_edit = __webpack_require__(105);

var _links_modal = __webpack_require__(114);

var _venue_modal = __webpack_require__(119);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItemEditModals = exports.ItemEditModals = function (_Component) {
  (0, _inherits3.default)(ItemEditModals, _Component);

  function ItemEditModals() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, ItemEditModals);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = ItemEditModals.__proto__ || (0, _getPrototypeOf2.default)(ItemEditModals)).call.apply(_ref, [this].concat(args))), _this), _this.getDateProps = function () {
      var _this$props$item = _this.props.item,
          all_day = _this$props$item.all_day,
          end_date = _this$props$item.end_date,
          start_date = _this$props$item.start_date;


      return {
        all_day: all_day,
        end_date: end_date,
        start_date: start_date
      };
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(ItemEditModals, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          item = _props.item,
          fetchUpload = _props.fetchUpload,
          isEditing = _props.isEditing,
          _onChange = _props.onChange,
          setEditing = _props.setEditing;


      return _react2.default.createElement(
        'div',
        null,
        isEditing === 'dates' && _react2.default.createElement(_dates_modal.DatesModal, (0, _extends3.default)({}, this.getDateProps(), {
          onChange: _onChange,
          setEditing: setEditing
        })),
        isEditing === 'embeds' && _react2.default.createElement(_embed_modal.EmbedModal, {
          embed_codes: item.embed_codes || [],
          onChange: function onChange(value) {
            return _onChange('embed_codes', value);
          },
          setEditing: setEditing
        }),
        isEditing === 'images' && _react2.default.createElement(_images_edit.ImagesEdit, {
          item: item,
          fetchUpload: fetchUpload,
          onChange: function onChange(value) {
            return _onChange('images', value);
          },
          setEditing: setEditing
        }),
        isEditing === 'formats' && _react2.default.createElement(_formats_modal.FormatsModal, {
          label: 'Formats',
          formats: item.formats || [],
          onChange: _onChange,
          setEditing: setEditing
        }),
        isEditing === 'links' && _react2.default.createElement(_links_modal.LinksModal, {
          links: item.links || [],
          onChange: function onChange(value) {
            return _onChange('links', value);
          },
          setEditing: setEditing
        }),
        isEditing === 'venue' && _react2.default.createElement(_venue_modal.VenueModal, {
          venue: item.venue || {},
          onChange: function onChange(value) {
            return _onChange('venue', value);
          },
          setEditing: setEditing
        })
      );
    }
  }]);
  return ItemEditModals;
}(_react.Component);

ItemEditModals.propTypes = {
  fetchUpload: _propTypes2.default.func,
  isEditing: _propTypes2.default.string,
  item: _propTypes2.default.object,
  isSaved: _propTypes2.default.bool,
  isSaving: _propTypes2.default.bool,
  onChange: _propTypes2.default.func,
  setEditing: _propTypes2.default.func
};


var mapStateToProps = function mapStateToProps(_ref2) {
  var itemReducer = _ref2.itemReducer;
  return {
    item: itemReducer.item,
    isSaved: itemReducer.isSaved,
    isSaving: itemReducer.isSaving
  };
};

var mapDispatchToProps = {
  fetchUpload: itemActions.fetchUpload
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ItemEditModals);

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ItemGrid = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _formats = __webpack_require__(33);

var _text = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItemGrid = exports.ItemGrid = function ItemGrid(props) {
  var artist = props.artist,
      condensed = props.condensed,
      date = props.date,
      description = props.description,
      formats = props.formats,
      image = props.image,
      title = props.title,
      venue = props.venue;

  var hasImage = image && image.url.length;
  var formattedTitle = artist ? artist + ': ' + (title || 'Missing Title') : title || 'Missing Title';

  return _react2.default.createElement(
    GridItem,
    { condensed: condensed },
    hasImage && _react2.default.createElement('img', { src: image.url }),
    hasImage ? _react2.default.createElement(
      _text.H3,
      null,
      formattedTitle
    ) : _react2.default.createElement(
      _text.H1,
      null,
      formattedTitle
    ),
    date && !formats && _react2.default.createElement(
      _text.H5,
      null,
      date
    ),
    venue && _react2.default.createElement(
      _text.H5,
      null,
      venue
    ),
    formats && formats.length && _react2.default.createElement(
      _text.H5,
      null,
      _react2.default.createElement(_formats.Formats, { formats: formats })
    ),
    description && _react2.default.createElement(
      _text.P,
      null,
      description
    )
  );
};

var GridItem = _styledComponents2.default.div.withConfig({
  displayName: 'item_grid__GridItem',
  componentId: 'sc-1pe8pb7-0'
})(['margin-bottom:4em;', '{font-size:3.5em;margin-top:0;', '}', '{', '}img{max-height:80vh;width:100%;max-width:100%;object-fit:cover;object-position:center;}', ' @media (max-width:76rem){', '{font-size:2.25em;}}'], _text.H1, function (props) {
  return props.condensed && '\n      font-size: 2.5em;\n    ';
}, _text.H3, function (props) {
  return props.condensed && '\n      margin-bottom: .5em;\n      font-size: 1.25em;\n    ';
}, function (props) {
  return props.condensed && '\n    margin-top: 20px;\n    margin-bottom: 50px;\n    padding: 0 10px;\n    @media (max-width: 76rem) {\n      margin-top: 10px;\n      margin-bottom: 30px;\n      padding: 10px 20px;\n    }\n  ';
}, _text.H1);

ItemGrid.propTypes = {
  artist: _propTypes2.default.string,
  condensed: _propTypes2.default.bool,
  date: _propTypes2.default.string,
  description: _propTypes2.default.string,
  formats: _propTypes2.default.array,
  image: _propTypes2.default.object,
  title: _propTypes2.default.string,
  venue: _propTypes2.default.string
};

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ItemTable = undefined;

var _taggedTemplateLiteral2 = __webpack_require__(20);

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  @media (max-width: 76em) {\n    max-width: 100%;\n    font-size: 1.3em;\n    line-height: 1.3em;\n  }\n'], ['\n  @media (max-width: 76em) {\n    max-width: 100%;\n    font-size: 1.3em;\n    line-height: 1.3em;\n  }\n']),
    _templateObject2 = (0, _taggedTemplateLiteral3.default)(['\n  margin-left: 0;\n  margin-right: 0;\n  padding: 12px 20px;\n\n  ', ' {\n    padding-left: 0;\n    padding-right: 0;\n  }\n\n  @media (max-width: 76rem) {\n    ', ' {\n      flex-direction: column;\n    }\n  }\n'], ['\n  margin-left: 0;\n  margin-right: 0;\n  padding: 12px 20px;\n\n  ', ' {\n    padding-left: 0;\n    padding-right: 0;\n  }\n\n  @media (max-width: 76rem) {\n    ', ' {\n      flex-direction: column;\n    }\n  }\n']);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactStyledFlexboxgrid = __webpack_require__(15);

var _formats = __webpack_require__(33);

var _text = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItemTable = exports.ItemTable = function ItemTable(props) {
  var artist = props.artist,
      date = props.date,
      formats = props.formats,
      title = props.title,
      venue = props.venue;


  return _react2.default.createElement(
    TableItem,
    null,
    date && _react2.default.createElement(
      _reactStyledFlexboxgrid.Col,
      { xs: 12, lg: 3 },
      _react2.default.createElement(
        _text.H4,
        null,
        date
      )
    ),
    _react2.default.createElement(
      _reactStyledFlexboxgrid.Col,
      { xs: 12, lg: 6 },
      _react2.default.createElement(
        Title,
        null,
        artist && artist + ': ',
        title || 'Missing Title'
      )
    ),
    venue && _react2.default.createElement(
      _reactStyledFlexboxgrid.Col,
      { xs: 12, lg: 3 },
      _react2.default.createElement(
        _text.H4,
        null,
        venue
      )
    ),
    formats && formats.length && _react2.default.createElement(
      _reactStyledFlexboxgrid.Col,
      { xs: 12, lg: 3 },
      _react2.default.createElement(
        _text.H4,
        null,
        _react2.default.createElement(_formats.Formats, { formats: formats, short: true })
      )
    )
  );
};

var Title = _text.H4.extend(_templateObject);

var TableItem = _reactStyledFlexboxgrid.Row.extend(_templateObject2, _reactStyledFlexboxgrid.Col, _formats.FormatsContainer);

ItemTable.propTypes = {
  artist: _propTypes2.default.string,
  date: _propTypes2.default.string,
  formats: _propTypes2.default.array,
  title: _propTypes2.default.string,
  venue: _propTypes2.default.string
};

/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Item = exports.ListItem = undefined;

var _taggedTemplateLiteral2 = __webpack_require__(20);

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  padding: 0;\n'], ['\n  padding: 0;\n']);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactStyledFlexboxgrid = __webpack_require__(15);

var _item_table = __webpack_require__(110);

var _item_grid = __webpack_require__(109);

var _text = __webpack_require__(10);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ListItem = exports.ListItem = function ListItem(props) {
  var condensed = props.condensed,
      layout = props.layout,
      slug = props.slug,
      title = props.title,
      published = props.published;


  switch (layout) {
    case 'grid':
      {
        return _react2.default.createElement(
          GridItem,
          {
            xs: 12,
            sm: condensed ? 4 : 6,
            lg: condensed ? 3 : 5,
            condensed: condensed
          },
          _react2.default.createElement(
            Item,
            { layout: layout, published: published, condensed: condensed },
            _react2.default.createElement(
              'a',
              { href: slug },
              _react2.default.createElement(_item_grid.ItemGrid, props)
            )
          )
        );
      }
    case 'table':
      {
        return _react2.default.createElement(
          Item,
          { layout: layout, published: published, condensed: condensed },
          _react2.default.createElement(
            'a',
            { href: slug },
            _react2.default.createElement(_item_table.ItemTable, props)
          )
        );
      }
    default:
      {
        return _react2.default.createElement(
          Item,
          { layout: layout, published: published, condensed: condensed },
          _react2.default.createElement(
            'a',
            { href: slug },
            _react2.default.createElement(
              _text.H1,
              null,
              title || 'Missing Title'
            )
          )
        );
      }
  }
};

var Item = exports.Item = _styledComponents2.default.div.withConfig({
  displayName: 'list_item__Item',
  componentId: 'sc-1j8xv4j-0'
})(['a{text-decoration:none;}', ' ', ' ', ''], function (props) {
  return props.published === false && '\n    opacity: .45;\n  ';
}, function (props) {
  return props.layout === 'list' && '\n    &:first-child {\n      h1 {\n        margin-top: 0;\n      }\n    }\n  ';
}, function (props) {
  return props.layout === 'table' && '\n    border-top: 1px solid black;\n\n    &:last-child {\n      border-bottom: 1px solid black;\n    }\n    ' + (props.condensed === true && '\n      &:first-child {\n        border-top: none;\n      }\n    ') + '\n  ';
});

var GridItem = _reactStyledFlexboxgrid.Col.extend(_templateObject);

ListItem.propTypes = {
  artist: _propTypes2.default.string,
  date: _propTypes2.default.string,
  formats: _propTypes2.default.array,
  image: _propTypes2.default.object,
  layout: _propTypes2.default.string,
  slug: _propTypes2.default.string.isRequired,
  title: _propTypes2.default.string,
  venue: _propTypes2.default.string
};

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinkEdit = undefined;

var _taggedTemplateLiteral2 = __webpack_require__(20);

var _taggedTemplateLiteral3 = _interopRequireDefault(_taggedTemplateLiteral2);

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _templateObject = (0, _taggedTemplateLiteral3.default)(['\n  padding-bottom: 20px !important;\n  justify-content: flex-start !important;\n\n  div[class^="Col-"] {\n    padding-left: 0 !important;\n    &:last-child {\n      padding-left: 10px !important;\n    }\n  }\n\n  input {\n    font-size: .9em;\n    width: 100%;\n    border: none;\n    border-bottom: 1px solid;\n  }\n\n  .IconButton {\n    padding: 0;\n    font-size: 1.15em;\n    transition: color .3s;\n    &:hover {\n      color: red;\n    }\n  }\n\n  button.new {\n    font-size: .7em;\n    margin-top: -5px;\n    padding: 5px 10px;\n    text-transform: uppercase;\n    &:hover {\n      color: limegreen;\n    }\n  }\n'], ['\n  padding-bottom: 20px !important;\n  justify-content: flex-start !important;\n\n  div[class^="Col-"] {\n    padding-left: 0 !important;\n    &:last-child {\n      padding-left: 10px !important;\n    }\n  }\n\n  input {\n    font-size: .9em;\n    width: 100%;\n    border: none;\n    border-bottom: 1px solid;\n  }\n\n  .IconButton {\n    padding: 0;\n    font-size: 1.15em;\n    transition: color .3s;\n    &:hover {\n      color: red;\n    }\n  }\n\n  button.new {\n    font-size: .7em;\n    margin-top: -5px;\n    padding: 5px 10px;\n    text-transform: uppercase;\n    &:hover {\n      color: limegreen;\n    }\n  }\n']);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _reactStyledFlexboxgrid = __webpack_require__(15);

var _button = __webpack_require__(9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LinkEdit = exports.LinkEdit = function (_Component) {
  (0, _inherits3.default)(LinkEdit, _Component);

  function LinkEdit() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, LinkEdit);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = LinkEdit.__proto__ || (0, _getPrototypeOf2.default)(LinkEdit)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      link: {
        title: _this.props.title || '',
        url: _this.props.url || ''
      }
    }, _this.onChange = function (key, value) {
      var _this$props = _this.props,
          index = _this$props.index,
          onChange = _this$props.onChange;
      var link = _this.state.link;


      link[key] = value;
      _this.setState({ link: link });
      if (index || index === 0) {
        onChange(link, index);
      }
    }, _this.onNew = function () {
      var link = _this.state.link;
      var onChange = _this.props.onChange;


      if (link.url.length) {
        onChange(link);
        _this.setState({
          link: {
            title: '',
            url: ''
          }
        });
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(LinkEdit, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _state$link = this.state.link,
          title = _state$link.title,
          url = _state$link.url;
      var _props = this.props,
          autoFocus = _props.autoFocus,
          index = _props.index,
          onDelete = _props.onDelete;


      return _react2.default.createElement(
        LinkEditContainer,
        null,
        _react2.default.createElement(
          _reactStyledFlexboxgrid.Col,
          { sm: 5 },
          _react2.default.createElement('input', {
            autoFocus: autoFocus,
            placeholder: 'Title',
            value: title,
            onChange: function onChange(e) {
              return _this2.onChange('title', e.target.value);
            }
          })
        ),
        _react2.default.createElement(
          _reactStyledFlexboxgrid.Col,
          { sm: 5 },
          _react2.default.createElement('input', {
            placeholder: 'http://example.com',
            value: url,
            onChange: function onChange(e) {
              return _this2.onChange('url', e.target.value);
            }
          })
        ),
        _react2.default.createElement(
          _reactStyledFlexboxgrid.Col,
          { sm: 1 },
          index || index === 0 ? _react2.default.createElement(_button.Button, {
            borderless: true,
            icon: 'ban',
            onClick: function onClick() {
              return onDelete(index);
            }
          }) : _react2.default.createElement(_button.Button, {
            className: 'new',
            text: 'save',
            onClick: this.onNew
          })
        )
      );
    }
  }]);
  return LinkEdit;
}(_react.Component);

LinkEdit.propTypes = {
  autoFocus: _propTypes2.default.bool,
  index: _propTypes2.default.number,
  onChange: _propTypes2.default.func.isRequired,
  onDelete: _propTypes2.default.func,
  title: _propTypes2.default.string,
  url: _propTypes2.default.string
};


var LinkEditContainer = _reactStyledFlexboxgrid.Row.extend(_templateObject);

/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinksEdit = undefined;

var _extends2 = __webpack_require__(19);

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(8);

var _link_edit = __webpack_require__(112);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LinksEdit = exports.LinksEdit = function (_Component) {
  (0, _inherits3.default)(LinksEdit, _Component);

  function LinksEdit() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, LinksEdit);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = LinksEdit.__proto__ || (0, _getPrototypeOf2.default)(LinksEdit)).call.apply(_ref, [this].concat(args))), _this), _this.componentWillUnmount = function () {
      var _this$props = _this.props,
          links = _this$props.links,
          onChange = _this$props.onChange;

      var cleanedLinks = _this.checkEmpty();

      if (cleanedLinks !== links) {
        onChange(cleanedLinks);
      }
    }, _this.onChange = function (link, index) {
      var _this$props2 = _this.props,
          links = _this$props2.links,
          onChange = _this$props2.onChange;

      var newLinks = (0, _lodash.clone)(links);

      if (index || index === 0) {
        newLinks[index] = link;
      } else {
        newLinks.push(link);
      }
      onChange(newLinks);
    }, _this.onDelete = function (index) {
      var _this$props3 = _this.props,
          links = _this$props3.links,
          onChange = _this$props3.onChange;

      var newLinks = (0, _lodash.clone)(links);

      newLinks.splice(index, 1);
      onChange(newLinks);
    }, _this.checkEmpty = function () {
      var links = _this.props.links;

      var cleanedLinks = (0, _lodash.clone)(links);

      links.map(function (link, index) {
        if (!link.url.length) {
          cleanedLinks.splice(index, 1);
        }
      });
      return cleanedLinks;
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(LinksEdit, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var links = this.props.links;


      return _react2.default.createElement(
        'div',
        null,
        links.map(function (link, index) {
          return _react2.default.createElement(_link_edit.LinkEdit, (0, _extends3.default)({}, link, {
            index: index,
            key: index,
            onChange: _this2.onChange,
            onDelete: _this2.onDelete,
            autoFocus: index === 0
          }));
        }),
        _react2.default.createElement(_link_edit.LinkEdit, {
          link: {},
          onChange: this.onChange,
          autoFocus: links.length === 0
        })
      );
    }
  }]);
  return LinksEdit;
}(_react.Component);

LinksEdit.propTypes = {
  links: _propTypes2.default.array,
  onChange: _propTypes2.default.func
};

/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LinksModal = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _modal = __webpack_require__(18);

var _links_edit = __webpack_require__(113);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LinksModal = exports.LinksModal = function LinksModal(props) {
  var onChange = props.onChange,
      setEditing = props.setEditing,
      links = props.links;


  return _react2.default.createElement(
    _modal.Modal,
    { onClick: function onClick() {
        return setEditing(null);
      } },
    _react2.default.createElement(
      Label,
      null,
      'Links'
    ),
    _react2.default.createElement(_links_edit.LinksEdit, {
      links: links || [],
      onChange: onChange
    })
  );
};

var Label = _styledComponents2.default.label.withConfig({
  displayName: 'links_modal__Label',
  componentId: 'sc-17wyduc-0'
})(['padding-bottom:10px;']);

LinksModal.propTypes = {
  links: _propTypes2.default.array,
  onChange: _propTypes2.default.func,
  setEditing: _propTypes2.default.func
};

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalBackground = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ModalBackground = exports.ModalBackground = function ModalBackground(props) {
  var backgroundColor = props.backgroundColor,
      onClick = props.onClick;


  return _react2.default.createElement(ModalBackgroundContainer, {
    onClick: onClick,
    backgroundColor: backgroundColor
  });
};

var ModalBackgroundContainer = _styledComponents2.default.div.withConfig({
  displayName: 'modal_background__ModalBackgroundContainer',
  componentId: 'so33b9-0'
})(['position:fixed;left:0;right:0;top:0;bottom:0;z-index:1 ', ''], function (props) {
  return props.backgroundColor && '\n    background-color: ' + props.backgroundColor + ';\n  ';
});

ModalBackground.propTypes = {
  onClick: _propTypes2.default.func.isRequired,
  backgroundColor: _propTypes2.default.string
};

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Text = undefined;

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _plain_text = __webpack_require__(48);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Text = exports.Text = function Text(props) {
  var onClick = props.onClick,
      _onChange = props.onChange,
      placeholder = props.placeholder,
      text = props.text;


  return _react2.default.createElement(
    'div',
    {
      onClick: onClick || undefined,
      'data-placeholder': onClick && !text
    },
    _onChange ? _react2.default.createElement(_plain_text.PlainText, {
      content: text,
      placeholder: placeholder,
      onChange: function onChange(value) {
        return _onChange(value);
      }
    }) : text || placeholder || 'Start typing'
  );
};

Text.propTypes = {
  text: _propTypes2.default.string,
  onClick: _propTypes2.default.func,
  onChange: _propTypes2.default.func,
  placeholder: _propTypes2.default.string
};

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Venue = undefined;

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _forms = __webpack_require__(27);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Venue = exports.Venue = function Venue(props) {
  var onClick = props.onClick,
      venue = props.venue;
  var address = venue.address,
      city = venue.city,
      country = venue.country,
      state = venue.state,
      name = venue.name;

  var hasVenue = venue && (venue.name || venue.address);

  return _react2.default.createElement(
    VenueContainer,
    { onClick: onClick || undefined },
    name && _react2.default.createElement(
      'div',
      null,
      name
    ),
    address && _react2.default.createElement(
      'div',
      null,
      address
    ),
    hasVenue && (city || state || country) && _react2.default.createElement(
      'div',
      null,
      city,
      state && city ? ', ' + state : state,
      (state || city) && country ? ' ' + country : country
    ),
    !hasVenue && onClick && _react2.default.createElement(
      _forms.Placeholder,
      null,
      'Add Venue'
    )
  );
};

var VenueContainer = _styledComponents2.default.div.withConfig({
  displayName: 'venue__VenueContainer',
  componentId: 'r1zhs3-0'
})(['position:relative']);

Venue.propTypes = {
  onClick: _propTypes2.default.func,
  venue: _propTypes2.default.shape({
    address: _propTypes2.default.string,
    city: _propTypes2.default.string,
    country: _propTypes2.default.string,
    name: _propTypes2.default.string,
    state: _propTypes2.default.string
  })
};

/***/ }),
/* 118 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VenueEdit = undefined;

var _getPrototypeOf = __webpack_require__(3);

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = __webpack_require__(4);

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = __webpack_require__(5);

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = __webpack_require__(7);

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = __webpack_require__(6);

var _inherits3 = _interopRequireDefault(_inherits2);

var _styledComponents = __webpack_require__(2);

var _styledComponents2 = _interopRequireDefault(_styledComponents);

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _lodash = __webpack_require__(8);

var _reactStyledFlexboxgrid = __webpack_require__(15);

var _select_input = __webpack_require__(49);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VenueEdit = exports.VenueEdit = function (_Component) {
  (0, _inherits3.default)(VenueEdit, _Component);

  function VenueEdit(props) {
    (0, _classCallCheck3.default)(this, VenueEdit);

    var _this = (0, _possibleConstructorReturn3.default)(this, (VenueEdit.__proto__ || (0, _getPrototypeOf2.default)(VenueEdit)).call(this, props));

    _initialiseProps.call(_this);

    var venue = _this.props.venue;


    _this.state = {
      venue: {
        name: venue.name || null,
        address: venue.address || null,
        city: venue.city || null,
        state: venue.state || null,
        country: venue.country || null
      }
    };
    return _this;
  }

  (0, _createClass3.default)(VenueEdit, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _state$venue = this.state.venue,
          address = _state$venue.address,
          city = _state$venue.city,
          country = _state$venue.country,
          name = _state$venue.name,
          state = _state$venue.state;


      return _react2.default.createElement(
        VenueEditContainer,
        null,
        _react2.default.createElement(
          _reactStyledFlexboxgrid.Row,
          null,
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            { xs: 12, sm: 6 },
            _react2.default.createElement('input', {
              placeholder: 'Venue Name',
              value: name || '',
              onChange: function onChange(e) {
                return _this2.onChange('name', e.target.value);
              },
              autoFocus: true
            })
          ),
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            { xs: 12, sm: 6 },
            _react2.default.createElement('input', {
              placeholder: 'Address',
              value: address || '',
              onChange: function onChange(e) {
                return _this2.onChange('address', e.target.value);
              }
            })
          )
        ),
        _react2.default.createElement(
          _reactStyledFlexboxgrid.Row,
          null,
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            { xs: 12, sm: 4 },
            _react2.default.createElement('input', {
              placeholder: 'City',
              value: city || '',
              onChange: function onChange(e) {
                return _this2.onChange('city', e.target.value);
              }
            })
          ),
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            { xs: 12, sm: 2 },
            _react2.default.createElement(_select_input.SelectInput, {
              value: state || 0,
              states: true,
              onChange: function onChange(key, value) {
                return _this2.onChange('state', value);
              }
            })
          ),
          _react2.default.createElement(
            _reactStyledFlexboxgrid.Col,
            { xs: 12, sm: 6 },
            _react2.default.createElement('input', {
              placeholder: 'Country',
              value: country || '',
              onChange: function onChange(e) {
                return _this2.onChange('country', e.target.value);
              }
            })
          )
        )
      );
    }
  }]);
  return VenueEdit;
}(_react.Component);

VenueEdit.propTypes = {
  onChange: _propTypes2.default.func,
  venue: _propTypes2.default.shape({
    address: _propTypes2.default.string,
    city: _propTypes2.default.string,
    country: _propTypes2.default.string,
    name: _propTypes2.default.string,
    state: _propTypes2.default.string
  })
};

var _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this.onChange = function (key, value) {
    var onChange = _this3.props.onChange;

    var venue = (0, _lodash.clone)(_this3.state.venue);

    venue[key] = value;
    _this3.setState({ venue: venue });
    onChange(venue);
  };
};

var VenueEditContainer = _styledComponents2.default.div.withConfig({
  displayName: 'venue_edit__VenueEditContainer',
  componentId: 'sc-1eknlh6-0'
})(['input{font-size:1em;width:100%;border:none;border-bottom:1px solid #ddd;}select{font-size:1em;width:100%;}', '{&:first-child{margin:10px 0 30px 0;}', '{padding-left:0;}}'], _reactStyledFlexboxgrid.Row, _reactStyledFlexboxgrid.Col);

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VenueModal = undefined;

var _propTypes = __webpack_require__(1);

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _modal = __webpack_require__(18);

var _venue_edit = __webpack_require__(118);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VenueModal = exports.VenueModal = function VenueModal(props) {
  var onChange = props.onChange,
      setEditing = props.setEditing,
      venue = props.venue;


  return _react2.default.createElement(
    _modal.Modal,
    { onClick: function onClick() {
        return setEditing(null);
      } },
    _react2.default.createElement(
      'label',
      null,
      'Venue'
    ),
    _react2.default.createElement(_venue_edit.VenueEdit, {
      venue: venue || {},
      onChange: onChange
    })
  );
};

VenueModal.propTypes = {
  onChange: _propTypes2.default.func,
  setEditing: _propTypes2.default.func,
  venue: _propTypes2.default.shape({
    address: _propTypes2.default.string,
    city: _propTypes2.default.string,
    country: _propTypes2.default.string,
    name: _propTypes2.default.string,
    state: _propTypes2.default.string
  })
};

/***/ }),
/* 120 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _axios = __webpack_require__(58);

var _axios2 = _interopRequireDefault(_axios);

var _universalCookie = __webpack_require__(41);

var _universalCookie2 = _interopRequireDefault(_universalCookie);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var API_URL = "http://localhost:3000/api";

var cookies = new _universalCookie2.default();

var apiMiddleware = function apiMiddleware(_ref) {
  var dispatch = _ref.dispatch;
  return function (next) {
    return function (action) {
      if (action.type !== 'API') {
        return next(action);
      }

      var handleResponse = function handleResponse(res) {
        var _action$payload = action.payload,
            model = _action$payload.model,
            url = _action$payload.url;

        dispatch({
          type: action.payload.next.SUCCESS,
          payload: res.data,
          model: model
        });

        if (action.payload.next.SUCCESS === 'CREATE_ITEM_SUCCESS') {
          var _id = res.data.data._id;
          // redirect to new item

          var formattedUrl = url === '/publications' ? '/releases' : url;
          window.location.pathname = formattedUrl + '/' + _id;
        }

        if (action.payload.next.SUCCESS === 'DELETE_ITEM_SUCCESS') {
          var redirect = url.split('/')[1];
          var _formattedUrl = redirect === 'publications' ? 'releases' : redirect;

          // redirect to items list
          window.location.pathname = '/' + _formattedUrl;
        }

        if (action.payload.next.SUCCESS === 'LOGIN_USER_SUCCESS') {
          cookies.set('portfolio.session', res.data.session, { maxAge: 2592000 });
          window.location.pathname = '';
        }

        if (action.payload.next.SUCCESS === 'FETCH_UPLOAD_SUCCESS') {
          action.payload.cb(action.payload.file, res);
        }
      };

      var handleError = function handleError(error) {
        console.error(error);
        dispatch({
          type: action.payload.next.ERROR,
          payload: error.response
        });
      };

      var _action$payload2 = action.payload,
          data = _action$payload2.data,
          method = _action$payload2.method,
          query = _action$payload2.query,
          url = _action$payload2.url;

      var apiUrl = '' + API_URL + url;
      if (method === 'get') {
        _axios2.default.get(apiUrl, { params: query }).then(handleResponse).catch(function (error) {
          return handleError(error);
        });
      }
      if (method === 'post') {
        _axios2.default.post(apiUrl, data).then(handleResponse).catch(function (error) {
          return handleError(error);
        });
      }
      if (method === 'put') {
        _axios2.default.put(apiUrl, data).then(handleResponse).catch(function (error) {
          return handleError(error);
        });
      }
      if (method === 'delete') {
        _axios2.default.delete(apiUrl, data).then(handleResponse).catch(function (error) {
          return handleError(error);
        });
      }
      dispatch({ type: action.payload.next.PENDING });
    };
  };
};

exports.default = apiMiddleware;

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var logMiddleware = exports.logMiddleware = function logMiddleware(_ref) {
  var getState = _ref.getState,
      dispatch = _ref.dispatch;
  return function (next) {
    return function (action) {
      console.log("" + action.type);
      next(action);
    };
  };
};

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _redux = __webpack_require__(61);

var _item = __webpack_require__(123);

var _items = __webpack_require__(124);

var _page = __webpack_require__(125);

var _settings = __webpack_require__(126);

var _user = __webpack_require__(127);

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rootReducer = (0, _redux.combineReducers)({
  itemReducer: _item.itemReducer,
  itemsReducer: _items.itemsReducer,
  pageReducer: _page.pageReducer,
  settingsReducer: _settings.settingsReducer,
  user: _user2.default
});

exports.default = rootReducer;

/***/ }),
/* 123 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.itemReducer = undefined;

var _assign = __webpack_require__(11);

var _assign2 = _interopRequireDefault(_assign);

var _lodash = __webpack_require__(8);

var _actions = __webpack_require__(12);

var _item = __webpack_require__(21);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = {
  item: {},
  isSaved: true,
  isSaving: false,
  loading: false,
  uploading: false,
  upload: {}
};

var itemReducer = exports.itemReducer = function itemReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case _actions.CHANGE_ITEM:
      {
        var item = (0, _lodash.clone)(state.item);
        var _action$payload = action.payload,
            key = _action$payload.key,
            value = _action$payload.value;


        item[key] = value;
        return (0, _assign2.default)({}, state, {
          item: item,
          isSaved: false,
          isSaving: !item.published
        });
      }

    case _item.FETCH_ITEM_REQUESTED:
      {
        return (0, _assign2.default)({}, state, {
          loading: true
        });
      }

    case _item.FETCH_ITEM_SUCCESS:
      var payload = action.payload,
          model = action.model;


      return (0, _assign2.default)({}, state, {
        item: payload.item,
        loading: false,
        model: model
      });

    case _item.FETCH_ITEM_ERROR:
      return (0, _assign2.default)({}, state, {
        loading: false,
        error: action.payload.error
      });

    case _actions.UPDATE_ITEM.PENDING:
      return (0, _assign2.default)({}, state, {
        isSaving: true,
        item: state.item
      });

    case _actions.UPDATE_ITEM.SUCCESS:
      return (0, _assign2.default)({}, state, {
        error: null,
        isSaved: true,
        item: action.payload,
        isSaving: false
      });

    case _actions.UPDATE_ITEM.ERROR:
      return (0, _assign2.default)({}, state, {
        isSaving: false,
        error: action.payload
      });

    case _actions.DELETE_ITEM.PENDING:
      return (0, _assign2.default)({}, state, {
        loading: true
      });

    case _actions.DELETE_ITEM.SUCCESS:
      return (0, _assign2.default)({}, state, {
        loading: true
      });

    case _actions.DELETE_ITEM.ERROR:
      return (0, _assign2.default)({}, state, {
        loading: false,
        item: state.item
      });

    case _item.RESET_ITEM:
      return (0, _assign2.default)({}, state, {
        item: {},
        loading: false,
        uploading: false
      });

    case _actions.FETCH_UPLOAD.PENDING:
      return (0, _assign2.default)({}, state, {
        uploading: true
      });

    case _actions.FETCH_UPLOAD.SUCCESS:
      return (0, _assign2.default)({}, state, {
        uploading: false,
        upload: action.payload
      });

    case _actions.FETCH_UPLOAD.ERROR:
      return (0, _assign2.default)({}, state, {
        uploading: false
      });
    case _actions.RESET_UPLOAD:
      return initialState;

    default:
      return state;
  }
};

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.itemsReducer = undefined;

var _assign = __webpack_require__(11);

var _assign2 = _interopRequireDefault(_assign);

var _lodash = __webpack_require__(8);

var _actions = __webpack_require__(12);

var _items = __webpack_require__(22);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = {
  loading: false,
  list: []
};

var itemsReducer = exports.itemsReducer = function itemsReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case _items.FETCH_ITEMS_REQUESTED:
      return (0, _assign2.default)({}, state, {
        loading: true
      });

    case _items.FETCH_ITEMS_SUCCESS:
      {
        return (0, _assign2.default)({}, state, {
          list: action.payload.items,
          loading: false
        });
      }

    case _items.FETCH_ITEMS_ERROR:
      return (0, _assign2.default)({}, state, {
        loading: false,
        error: action.payload
      });

    case _actions.CREATE_ITEM.PENDING:
      return (0, _assign2.default)({}, state, {
        loading: true
      });

    case _actions.CREATE_ITEM.SUCCESS:
      var list = (0, _lodash.clone)(state.list);
      list.push(action.payload.data);

      return (0, _assign2.default)({}, state, {
        list: list,
        error: null
      });

    case _actions.CREATE_ITEM.ERROR:
      return (0, _assign2.default)({}, state, {
        loading: false,
        error: action.payload
      });
    case _items.RESET_ITEMS:
      return (0, _assign2.default)({}, state, {
        loading: false,
        list: []
      });
    default:
      return state;
  }
};

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pageReducer = undefined;

var _assign = __webpack_require__(11);

var _assign2 = _interopRequireDefault(_assign);

var _page = __webpack_require__(26);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = {
  loading: false,
  page: {}
};

var pageReducer = exports.pageReducer = function pageReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case _page.FETCH_PAGE_REQUESTED:
      return (0, _assign2.default)({}, state, {
        loading: true
      });

    case _page.FETCH_PAGE_SUCCESS:
      {
        return (0, _assign2.default)({}, state, {
          page: action.payload.page,
          loading: false
        });
      }

    case _page.FETCH_PAGE_ERROR:
      return (0, _assign2.default)({}, state, {
        loading: false,
        error: action.payload
      });

    case _page.RESET_PAGE:
      return (0, _assign2.default)({}, state, {
        loading: false,
        page: {}
      });

    default:
      return state;
  }
};

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.settingsReducer = undefined;

var _assign = __webpack_require__(11);

var _assign2 = _interopRequireDefault(_assign);

var _actions = __webpack_require__(12);

var _settings = __webpack_require__(43);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = {
  settings: {},
  loading: false,
  saving: false
};

var settingsReducer = exports.settingsReducer = function settingsReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case _actions.FETCH_SETTINGS.PENDING:
      return (0, _assign2.default)({}, state, {
        loading: true
      });

    case _settings.FETCH_SETTINGS_SUCCESS:
      return (0, _assign2.default)({}, state, {
        loading: false,
        settings: action.payload.settings
      });

    case _actions.FETCH_SETTINGS.ERROR:
      return (0, _assign2.default)({}, state, {
        loading: false
      });

    case _actions.CREATE_SETTINGS.PENDING:
      return (0, _assign2.default)({}, state, {
        saving: true,
        settings: state.settings[0]
      });

    case _actions.CREATE_SETTINGS.SUCCESS:
      return (0, _assign2.default)({}, state, {
        saving: false,
        settings: action.payload.settings[0],
        error: null
      });

    case _actions.CREATE_SETTINGS.ERROR:
      return (0, _assign2.default)({}, state, {
        saving: false,
        error: action.payload.data,
        settings: state.settings
      });

    case _actions.UPDATE_SETTINGS.PENDING:
      return (0, _assign2.default)({}, state, {
        saving: true,
        settings: state.settings
      });

    case _actions.UPDATE_SETTINGS.SUCCESS:
      return (0, _assign2.default)({}, state, {
        saving: false,
        settings: action.payload.settings,
        error: null
      });

    case _actions.UPDATE_SETTINGS.ERROR:
      return (0, _assign2.default)({}, state, {
        saving: false,
        error: action.payload.data,
        settings: state.settings
      });

    case _actions.RESET_SETTINGS:
      return (0, _assign2.default)({}, state, {
        loading: false,
        settings: state.settings
      });

    case _actions.FETCH_UPLOAD.PENDING:
      return (0, _assign2.default)({}, state, {
        uploading: true
      });

    case _actions.FETCH_UPLOAD.SUCCESS:
      return (0, _assign2.default)({}, state, {
        uploading: false,
        upload: action.payload
      });

    case _actions.FETCH_UPLOAD.ERROR:
      return (0, _assign2.default)({}, state, {
        uploading: false
      });

    case _actions.RESET_UPLOAD:
      return initialState;

    default:
      return state;
  }
};

/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userReducer = exports.initialState = undefined;

var _assign = __webpack_require__(11);

var _assign2 = _interopRequireDefault(_assign);

var _actions = __webpack_require__(12);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var initialState = exports.initialState = {
  loading: false,
  isAuthenticated: false,
  currentUser: null,
  session: null,
  error: null
};

var userReducer = exports.userReducer = function userReducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];

  switch (action.type) {
    case _actions.CREATE_USER.PENDING:
      return (0, _assign2.default)({}, state, {
        loading: true
      });

    case _actions.CREATE_USER.SUCCESS:
      return (0, _assign2.default)({}, state, {
        loading: false,
        isAuthenticated: true,
        error: null,
        currentUser: action.payload.currentUser,
        session: action.payload.session
      });

    case _actions.CREATE_USER.ERROR:
      return (0, _assign2.default)({}, state, {
        loading: false,
        isAuthenticated: false,
        error: action.payload.error
      });

    case _actions.LOGIN_USER.PENDING:
      return (0, _assign2.default)({}, state, {
        loading: true,
        error: null
      });

    case _actions.LOGIN_USER.SUCCESS:
      return (0, _assign2.default)({}, state, {
        loading: false,
        isAuthenticated: true,
        error: null,
        currentUser: action.payload.currentUser,
        session: action.payload.session
      });

    case _actions.LOGIN_USER.ERROR:
      return (0, _assign2.default)({}, state, {
        loading: false,
        isAuthenticated: false,
        error: action.payload.error,
        currentUser: null,
        session: null
      });

    case _actions.LOGOUT_USER:
      return (0, _assign2.default)({}, state, {
        loading: false,
        isAuthenticated: false,
        error: null,
        currentUser: null,
        session: null
      });

    default:
      return state;
  }
};

exports.default = userReducer;

/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var theme = exports.theme = {
  colors: {
    gray: '#ccc'
  }
};

/***/ }),
/* 129 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isServer = undefined;

var _api = __webpack_require__(120);

var _api2 = _interopRequireDefault(_api);

var _log = __webpack_require__(121);

var _redux = __webpack_require__(61);

var _connectedReactRouter = __webpack_require__(138);

var _reduxThunk = __webpack_require__(146);

var _reduxThunk2 = _interopRequireDefault(_reduxThunk);

var _history = __webpack_require__(141);

var _reducers = __webpack_require__(122);

var _reducers2 = _interopRequireDefault(_reducers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isServer = exports.isServer = !(typeof window !== 'undefined' && window.document && window.document.createElement);

exports.default = function (_ref) {
  var entry = _ref.entry,
      session = _ref.session;

  var history = isServer ? (0, _history.createMemoryHistory)({ initialEntries: [entry || '/'] }) : (0, _history.createBrowserHistory)();

  var enhancers = [];

  if ("development" === 'development' && !isServer) {
    var devToolsExtension = window.devToolsExtension;

    if (typeof devToolsExtension === 'function') {
      enhancers.push(devToolsExtension());
    }
  }

  var middleware = [_reduxThunk2.default, _log.logMiddleware, _api2.default, (0, _connectedReactRouter.routerMiddleware)(history)];

  var composedEnhancers = _redux.compose.apply(undefined, [_redux.applyMiddleware.apply(undefined, middleware)].concat(enhancers));

  var initialState = !isServer ? window.__INITIAL_DATA__ : {
    user: {
      isAuthenticated: session && true,
      session: session
    }
  };

  if (!isServer) {
    delete window.__INITIAL_DATA__;
  }

  var store = (0, _redux.createStore)((0, _connectedReactRouter.connectRouter)(history)(_reducers2.default), initialState, composedEnhancers);

  return {
    store: store,
    history: history
  };
};

/***/ }),
/* 130 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ServerRender = undefined;

var _react = __webpack_require__(0);

var _react2 = _interopRequireDefault(_react);

var _server = __webpack_require__(144);

var _serializeJavascript = __webpack_require__(147);

var _serializeJavascript2 = _interopRequireDefault(_serializeJavascript);

var _reactHelmet = __webpack_require__(40);

var _reactRedux = __webpack_require__(14);

var _styledComponents = __webpack_require__(2);

var _reactRouterDom = __webpack_require__(30);

var _App = __webpack_require__(78);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _process$env = process.env,
    GOOGLE_ANALYTICS_ID = "",
    GOOGLE_FONTS_FAMILY = "Roboto";
var ServerRender = exports.ServerRender = function ServerRender(req, store, context) {
  var sheet = new _styledComponents.ServerStyleSheet();
  var markup = (0, _server.renderToString)(sheet.collectStyles(_react2.default.createElement(
    _reactRedux.Provider,
    { store: store },
    _react2.default.createElement(
      _reactRouterDom.StaticRouter,
      { location: req.url, context: context },
      _react2.default.createElement(_App.App, null)
    )
  )));

  var styles = sheet.getStyleTags();
  var head = _reactHelmet.Helmet.rewind();

  return '\n    <!DOCTYPE html>\n    <html lang="en-us">\n      <head>\n        ' + head.title + '\n        ' + head.meta + '\n        ' + styles + '\n\n        <meta name="viewport" content="width=device-width, initial-scale=1"> \n        <link\n          rel="stylesheet"\n          type="text/css"\n          href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"\n          integrity=\'sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN\'\n          crossorigin=\'anonymous\'\n        />\n        <script async src="https://www.googletagmanager.com/gtag/js?id=' + GOOGLE_ANALYTICS_ID + '"></script>\n        <script>\n          window.dataLayer = window.dataLayer || [];\n          function gtag(){dataLayer.push(arguments);}\n          gtag(\'js\', new Date());\n          gtag(\'config\', ' + (0, _serializeJavascript2.default)(GOOGLE_ANALYTICS_ID) + ');\n        </script>\n        <link href="https://fonts.googleapis.com/css?family=' + GOOGLE_FONTS_FAMILY + '" rel="stylesheet">\n        <script src="/bundle.js" defer></script>\n        <script>window.__INITIAL_DATA__ = ' + (0, _serializeJavascript2.default)(store.getState()) + '</script>\n      </head>\n\n      <body style="margin:0">\n        <div id="app">' + markup + '</div>\n      </body>\n    </html>\n  ';
};

/***/ }),
/* 131 */
/***/ (function(module, exports) {

module.exports = require("aws-sdk");

/***/ }),
/* 132 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/get-iterator");

/***/ }),
/* 133 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/object/keys");

/***/ }),
/* 134 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/core-js/promise");

/***/ }),
/* 135 */
/***/ (function(module, exports) {

module.exports = require("babel-runtime/helpers/objectWithoutProperties");

/***/ }),
/* 136 */
/***/ (function(module, exports) {

module.exports = require("bcrypt");

/***/ }),
/* 137 */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),
/* 138 */
/***/ (function(module, exports) {

module.exports = require("connected-react-router");

/***/ }),
/* 139 */
/***/ (function(module, exports) {

module.exports = require("cors");

/***/ }),
/* 140 */
/***/ (function(module, exports) {

module.exports = require("draft-convert");

/***/ }),
/* 141 */
/***/ (function(module, exports) {

module.exports = require("history");

/***/ }),
/* 142 */
/***/ (function(module, exports) {

module.exports = require("jsonwebtoken");

/***/ }),
/* 143 */
/***/ (function(module, exports) {

module.exports = require("morgan");

/***/ }),
/* 144 */
/***/ (function(module, exports) {

module.exports = require("react-dom/server");

/***/ }),
/* 145 */
/***/ (function(module, exports) {

module.exports = require("react-waypoint");

/***/ }),
/* 146 */
/***/ (function(module, exports) {

module.exports = require("redux-thunk");

/***/ }),
/* 147 */
/***/ (function(module, exports) {

module.exports = require("serialize-javascript");

/***/ }),
/* 148 */
/***/ (function(module, exports) {

module.exports = require("underscore");

/***/ }),
/* 149 */
/***/ (function(module, exports) {

module.exports = require("universal-cookie-express");

/***/ }),
/* 150 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(63);
module.exports = __webpack_require__(62);


/***/ })
/******/ ]);