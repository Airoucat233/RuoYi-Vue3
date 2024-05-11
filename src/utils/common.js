import router from '@/router/index.js'


export function isEmpty(val){
    // null or undefined
  if (val == null) return true;

  if (typeof val === 'boolean') return false;

  if (typeof val === 'number') return false;

  switch (Object.prototype.toString.call(val)) {
    // String or Array
    case '[object String]':
      return val === 'undefined' || val === 'null' || val.trim() === ''
    case '[object Array]':
      return !val.length;

    // Map or Set or File
    case '[object File]':
    case '[object Map]':
    case '[object Set]': {
      return !val.size;
    }
    // Plain Object
    case '[object Object]': {
      return !Object.keys(val).length;
    }
  }
  return false;
}

//右上角加载框
// export function loadingTip(component,text,fun,...args) {
//     /*text格式:{
//         loading:{title:'加载中',message:''},
//         success:{title:'成功',message:''},
//         warning:{title:'警告',message:''},
//         fail:{title:'失败',message:''}
//     }*/
//     let that = component
//     let load = that.$notify({
//         title: text.loading.title,
//         message: text.loading.message,
//         duration: 0,
//         iconClass:'loading-icon',
//     })
//     return new Promise((resolve,reject)=>{
//         fun(...args).then((res)=>{
//             let nowLoad
//             if(!load.closed){
//                 nowLoad = load
//             }
//             else{
//                 nowLoad = that.$notify()
//             }
//             nowLoad.title = text.success.title
//             nowLoad.message = text.success.message
//             nowLoad.iconClass = 'el-icon-success'
//             setTimeout(()=>{
//                 nowLoad.close()
//             },4500)
//             resolve(res)
//         }).catch(err=>{
//             let nowLoad
//             if(!load.closed){
//                 nowLoad = load
//             }
//             else{
//                 nowLoad = that.$notify()
//             }
//             nowLoad.title = text.fail.title
//             nowLoad.message = text.fail.message
//             nowLoad.iconClass = 'el-icon-error'
//             setTimeout(()=>{
//                 nowLoad.close()
//             },4500)
//             console.log('err->',err)
//             reject(err)
//         })
//     })
// }

// export function toDocs(path='/') {
//     if (typeof path !== 'string') {
//         path = '/';
//     }
//     let url = (process.env.NODE_ENV == 'development' ? 'http://localhost:8181' : process.env.VUE_APP_URL) + '/docs'
//     url += path
//     window.open(url)
// }

export function toUrl(path, params = null, isNew = false) {
    // 判断是否为完整的URL
    const isFullUrl = /^https?:\/\//i.test(path);
    if (isFullUrl) {
        // 如果是完整URL
        if (isNew) {
            // isNew为true时，在新窗口或新标签页中打开
            window.open(path, '_blank');
        } else {
            // 否则，在当前窗口中跳转
            window.location.href = path;
        }
    } else {
        // 否则，使用路由导航方法进行跳转，传递参数
        router.push({
            path: path,
            query: params??{}
        });
    }
}

//使用JSON.parse(str,parseJsonFunction)解析json字符串时转换其中的function
export function parseJsonFunction(key, value) {
	if (key == 'formatter' && "string" == typeof value
			&& value.indexOf('function') == 0) {
		return Function('return ' + value)();
	}
	return value;
}

//生成表的过滤字段
// export function generateQueryData(queryData,pagination,filter={},extra=[]) {
//     let fieldFilters = queryData
//     if(!isEmpty(filter)){
//         for(let key in filter){
//             if(isEmpty(filter[key])){
//                 break
//             }
//             let fieldFilter = fieldFilters.findObject('fieldName',key)
//             if(fieldFilter){
//                 if(typeof filter[key] == 'object'){
//                     fieldFilter = Object.assign(fieldFilter,filter[key])
//                 }else{
//                     fieldFilter.value = filter[key]
//                 }
//             }else{
//                 if(typeof filter[key] == 'object'){
//                     extra.push(filter[key])
//                 }else{
//                     extra.push({ fieldName: key, value: filter[key],queryType: 'eq', label: key })
//                 }
//             }
//         }
//     }
//     fieldFilters = fieldFilters.concat(extra)
//     let sort;
//     if(!isEmpty(pagination.sort)){
//         sort = pagination.sort
//     }else{
//         sort = pagination.descending ? 'desc' : 'asc'
//     }
//     let query = {
//         pageDomain: {
//             pageNum: pagination.page,
//             pageSize: pagination.rowsPerPage,
//             orderBy: pagination.sortBy,
//             sort,
//         },
//         fieldFilters
//     }
//     return query
// }
