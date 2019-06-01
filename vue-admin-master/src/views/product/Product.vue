<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" placeholder="关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getProducts">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="managerViewProperties">显示属性管理</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="managerSkuProperties">sku属性管理</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">上架</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">下架</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--
        id
        createTime
        updateTime
        name
        subName
        code
        product_type_id
        onSaleTime
        offSaleTime
        brand_id
        state
        maxPrice
        minPrice
        saleCount
        viewCount
        commentCount
        commentScore
        viewProperties
        goodCommentCount
        commonCommentCount
        badCommentCount
        -->
        <!--
        name
        subName
        product_type_id
        onSaleTime
        offSaleTime
        brand_id
        state
        viewCount
        viewProperties
        -->
        <!--列表-->
        <el-table :data="products" highlight-current-row v-loading="listLoading"
                  @selection-change="selsChange"
                  @row-click="rowClick"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="标题" :show-overflow-tooltip="true" width="180" sortable>
            </el-table-column>
            <el-table-column prop="subName" label="副标题" :show-overflow-tooltip="true" width="200" sortable>
            </el-table-column>
            <el-table-column prop="onSaleTime" label="上架时间" width="200" sortable>
            </el-table-column>
            <el-table-column prop="offSaleTimeString" label="下架时间" width="200" sortable>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="200" sortable>
                <template slot-scope="scope">
                    <el-popover placement="top">
                        <div v-if="scope.row.state===1" slot="reference" class="name-wrapper">
                            <el-tag size="medium" class="stateStyle1">上架
                            </el-tag>
                        </div>
                        <div v-else-if="scope.row.state===0" slot="reference" class="name-wrapper">
                            <el-tag size="medium" class="stateStyle2">下架
                            </el-tag>
                        </div>
                    </el-popover>

                </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>
        <!--编辑和添加界面
        -->
        <el-dialog title="编辑" v-model="formVisible" :close-on-click-modal="false">
            <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
                <el-form-item label="标题" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="副标题" prop="subName">
                    <el-input v-model="form.subName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="商品分类" prop="productTypeId">
                    <!--<el-input v-model="form.productTypeId" auto-complete="off"></el-input>-->
                    <select-tree width="200" :options="productTypes" v-model="form.productTypeId"/>
                </el-form-item>
                <el-form-item label="品牌" prop="brandId">
                    <el-select v-model="form.brandId" clearable placeholder="请选择">
                        <el-option
                                v-for="item in brands"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <!--简介description详情richContent-->
                <el-form-item label="简介" prop="productExt.description">
                    <el-input v-model="form.productExt.description" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="详情" prop="productExt.richContent">
                    <div class="edit_container">
                        <quill-editor v-model="form.productExt.richContent" ref="myQuillEditor" class="editer"
                                      :options="editorOption" @ready="onEditorReady($event)">
                        </quill-editor>
                    </div>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--显示属性的dialog-->
        <el-dialog title="编辑" v-model="viewPropertiesVisible" :close-on-click-modal="false">
            <!--viewProperties是一个数组！-->
            <el-card class="box-card">
                <div v-for="p in viewProperties" :key="p" class="text item">
                    {{p.specName}}:
                    <el-input v-model="p.value" auto-complete="off"></el-input>
                </div>
            </el-card>
            <!--显示属性的dialog的取消和提交-->
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="viewPropertiesVisible = false">取消</el-button>
                <el-button type="primary" @click.native="viewPropertiesSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--sku显示属性的dialog-->
        <el-dialog title="编辑" v-model="skuPropertiesVisible" :close-on-click-modal="false">
            <el-card class="box-card">
                <div v-for="p in skuProperties" :key="p" class="text item">
                    {{p.specName}}:
                    <!--sku的值的输入框多少是根据你的值的多少来显示的：
                    后台的属性字段中的一个skuValues的自得：是一个字符数组！
                    p.skuValues数组遍历！
                    i in 2===》表示循环了两次！
                    -->
                    <div v-for="i in p.skuValues.length+1" :key="i">
                        <el-input v-model="p.skuValues[i-1]" auto-complete="off" style="width: 90%"></el-input>
                        <el-button type="primary" @click="p.skuValues.splice(i-1,1)" :loading="editLoading">删除
                        </el-button>
                    </div>
                </div>
            </el-card>
            <!--https://element.eleme.cn/#/zh-CN/component/table-->
            <el-table :data="skuDatas">
                <!--cols一堆列,col哪一列-->
                <template v-for="(col ,index) in cols">
                    <el-table-column :prop="col.prop" sortable :label="col.label"
                                     v-if="['price','availableStock'].includes(col.prop)">
                        <!--scope:作用域的问题-->
                        <template scope="scope">
                            <el-input auto-complete="off" v-model="skuDatas[scope.$index].price" style="width: 400px"
                                      v-if="'price'===col.prop"/>
                            <el-input auto-complete="off" v-model="skuDatas[scope.$index].availableStock"
                                      style="width: 400px" v-if="'availableStock'===col.prop"/>
                        </template>
                    </el-table-column>
                    <!--只做显示-->
                    <el-table-column :prop="col.prop" sortable :label="col.label"
                                     v-if="!['price','availableStock'].includes(col.prop)">
                    </el-table-column>
                </template>
            </el-table>
            <!--sku属性的dialog的取消和提交-->
            <!--https://www.cnblogs.com/joans/p/3981122.html的splice(index,len,[item])    注释：该方法会改变原始数组。
            index:数组开始下标        len: 替换/删除的长度       item:替换的值，删除操作的话 item为空-->
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="skuPropertiesVisible = false">取消</el-button>
                <el-button type="primary" @click.native="skuPropertiesSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>

</template>
<script>
    import SelectTree from '@/components/SelectTree.vue';
    import {quillEditor} from "vue-quill-editor";
    import "quill/dist/quill.core.css"
    import "quill/dist/quill.snow.css"
    import "quill/dist/quill.bubble.css"

    export default {
        computed: {
            editor() {
                return this.$refs.myQuillEditor.quill
            }
        },
        components: {
            SelectTree, quillEditor
        },
        data() { //数据
            return {
                brands: [],
                filters: {
                    keyword: ''
                },
                editorOption: {},
                products: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列
                fileList2: [],
                formVisible: false,//编辑界面是否显示
                editLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                staticIp: "http://192.168.0.121",
                //编辑界面数据
                form: {
                    name: '',
                    subName: '',
                    brandId: '',
                    productTypeId: '',
                    productExt: {"description": "", "richContent": ""}
                },
                // 默认选中值
                selected: 'A',
                // 数据默认字段
                defaultProps: {
                    parent: 'pid',                  // 父级唯一标识
                    value: 'id',                    // 唯一标识
                    label: 'name',                  // 标签显示
                    children: 'children',           // 子级
                },

                productTypes: [],                    // 数据列表
                viewPropertiesVisible: false,        //显示属性的dialog默认是关闭的！
                viewProperties: [],                  //显示属性的对象！
                skuPropertiesVisible: false,         //sku显示属性的dialog默认是关闭的！
                skuProperties: [],                   //sku显示属性的数组对象！
                skuDatas: [],                         //sku属性有多个值！
                cols: [],                             //table的头很多的头的数组！
                currentRow: null,                    //选中行默认为null！
            }
        },
        /*https://www.cnblogs.com/dupd/p/5887907.html*/
        watch: {
            skuProperties: {
                handler(curVal, oldVal) {
                    // 过滤掉用户没有填写数据的规格参数
                    const arr = this.skuProperties.filter(s => s.skuValues.length > 0);
                    // 通过reduce进行累加笛卡尔积
                    var skus = arr.reduce((last, spec) => {
                        const result = [];
                        last.forEach(o => {
                            spec.skuValues.forEach(option => {
                                // option //一个一一个值 黄皮肤
                                const obj = {};
                                Object.assign(obj, o);
                                obj[spec.specName] = option;
                                result.push(obj);
                            })
                        })
                        return result
                    }, [{}]);
                    //添加不存在的列
                    skus.forEach(function (item) {
                        item['price'] = '';
                        item['availableStock'] = '';
                    })
                    this.skuDatas = skus;
                    let headers = [];
                    //现在没有一定有字段 库存 价格  颜色
                    //skus [{"身高":170,"三维":"xxx",价格:18,库存:18,是否可用:0},{"身高":170,"三维":"xxx",价格:18,库存:18,是否可用:0}]
                    //获取这个对象的所有的key
                    Object.keys(this.skuDatas[0]).forEach(sku => {
                        let value = sku;
                        if (sku == 'price') {
                            value = '价格'
                        }
                        if (sku == 'availableStock') {
                            value = '库存'
                        }
                        let col = {"label": value, "prop": sku};
                        headers.push(col);
                    });
                    this.cols = headers;
                },
                deep: true
            }
        },
        methods: {
            //sku的显示属性编辑方法！
            managerSkuProperties: function () {
                if (this.currentRow) {  //row-click当某一行被点击时会触发该事件 row, column, event
                    this.skuPropertiesVisible = true; //有值//②点击显示属性按钮-->弹出一个dialog！cd
                    let productTypeId = this.currentRow.productTypeId;
                    //③获取到当前的产品的类型的显示属性！
                    //http://localhost:9527/aigou/product/product/viewProperties/3
                    let skuPropertiesUrl = "/aigou/product/product/skuProperties/" + productTypeId;
                    this.$http.get(skuPropertiesUrl).then(res => {
                        //直接把返回的数据，赋予给页面的变量！
                        this.skuProperties = res.data;
                        console.debug(this.skuProperties);//拿到值了！
                    })
                } else {
                    //么有选中请给个提示并且返回！
                    this.$message({
                        message: "请至少选中一行数据请选中需要设置的数据！",
                        type: "warning"
                    });
                    return;
                }
            },
            skuPropertiesSubmit: function () {
                //sku的属性保存！操作的
                let productId = this.currentRow.id;
                let params = {"productId": productId, "skuProperties": this.skuProperties, "skuDatas": this.skuDatas}
                this.$http.post("/aigou/product/product/skuProperties", params).then(res => {
                    //直接把返回的数据，赋予给页面的变量！
                    if (res.data.success) {
                        this.$message({
                            message: res.data.msg,
                            type: 'success'
                        });
                    } else {
                        this.$message({
                            message: res.data.msg,
                            type: 'error'
                        });
                    }
                    this.skuPropertiesVisible = false;//关闭dialog
                })
            },
           /* skuDatas: [{颜色: "yellow", 尺寸: "26D", price: "26", availableStock: "88"},…]
            0: {颜色: "yellow", 尺寸: "26D", price: "26", availableStock: "88"}
            availableStock: "88"
            price: "26"
            尺寸: "26D"
            颜色: "yellow"
            1: {颜色: "yellow", 尺寸: "9", price: "9", availableStock: "9"}
            availableStock: "9"
            price: "9"
            尺寸: "9"
            颜色: "yellow"
            skuProperties: [{id: 33, specName: "颜色", type: 2, productTypeId: 9, value: null, skuValues: ["yellow", "yellow"]},…]
            0: {id: 33, specName: "颜色", type: 2, productTypeId: 9, value: null, skuValues: ["yellow", "yellow"]}
            id: 33
            productTypeId: 9
            skuValues: ["yellow", "yellow"]
            0: "yellow"
            1: "yellow"
            specName: "颜色"
            type: 2
            value: null
            1: {id: 34, specName: "尺寸", type: 2, productTypeId: 9, value: null, skuValues: ["26D", "9"]}
            id: 34
            productTypeId: 9
            skuValues: ["26D", "9"]
            specName: "尺寸"
            type: 2
            value: null*/

            //显示属性的提交！
            viewPropertiesSubmit: function () {
                //后台发送一个请求：关键是我要得到viewProperties！
                //把这个存到t_product_ext表的一个viewProperties，里面根据productId进行过滤！
                let productId = this.currentRow.id;
                let params = {"productId": productId, "viewProperties": this.viewProperties}
                this.$http.post("/aigou/product/product/viewProperties", params).then(res => {
                    //直接把返回的数据，赋予给页面的变量！
                    if (res.data.success) {
                        this.$message({
                            message: res.data.msg,
                            type: 'success'
                        });
                    } else {
                        this.$message({
                            message: res.data.msg,
                            type: 'error'
                        });
                    }
                    this.viewPropertiesVisible = false;//关闭dialog
                })
            },


            rowClick(row, column, event) {          //点击一行数据触发点击事件：row选中行！
                this.currentRow = row;                //把选中的行赋值给变量！
            },
            //显示属性管理
            managerViewProperties() {//①选中行判断！https://element.eleme.cn/2.8/#/zh-CN/component/table#table-biao-ge
                if (this.currentRow) {  //row-click当某一行被点击时会触发该事件 row, column, event
                    this.viewPropertiesVisible = true; //有值//②点击显示属性按钮-->弹出一个dialog！cd
                    let productTypeId = this.currentRow.productTypeId;
                    let productId = this.currentRow.id;
                    //③获取到当前的产品的类型的显示属性！
                    //http://localhost:9527/aigou/product/product/viewProperties/3
                    let viewPropertiesUrl = "/aigou/product/product/viewProperties/" + productTypeId + "/" + productId;
                    this.$http.get(viewPropertiesUrl).then(res => {
                        //直接把返回的数据，赋予给页面的变量！
                        this.viewProperties = res.data;
                        console.debug(this.viewProperties);//拿到值了！
                    })
                } else {
                    //么有选中请给个提示并且返回！
                    this.$message({
                        message: "请至少选中一行数据请选中需要设置的数据！",
                        type: "warning"
                    });
                    return;
                }


            },
            onEditorReady(editor) {
            },
            formatSex: function (row, column) {
                //return row.state === 1 ? '男' : row.state === 0 ? '女' : '未知'
                return row.state === 1 ? '上架' : '下架'
            },
            //方法\
            handleSuccess(response, file, fileList) {
                //上传成功回赛调
                this.form.logo = response.object;
            },
            handleRemove(file, fileList) {
                var filePath1;
                if (file.response) {
                    filePath1 = file.response.object;
                }
                var filePath2 = file.lg;
                var filePath = "";
                if (filePath1) {
                    filePath = filePath1;
                } else if (filePath2) {
                    filePath = filePath2;
                }
                this.$http.delete("/common/common/delete?filePath=" + filePath)
                    .then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功!',
                                type: 'success'
                            });
                        } else {
                            this.$message({
                                message: '删除失败!',
                                type: 'error'
                            });
                        }
                    })
            },
            handlePreview(file) {
                console.log(file);
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getProducts();
            },
            //获取品牌的列表:
            getProducts() {
                //查询条件
                let para = {
                    page: this.page,
                    keyword: this.filters.keyword
                };
                //加载
                this.listLoading = true;
                //异步请求:
                this.$http.post("/aigou/product/product/json", para)
                    .then((res) => {
                        console.log(this);
                        this.total = res.data.total;
                        this.products = res.data.rows;
                        this.listLoading = false;
                    });
            },
            getBrands() {
                //加载
                this.listLoading = true;
                //异步请求:
                this.$http.get("/aigou/product/brand/list")
                    .then((res) => {
                        this.brands = res.data;
                        this.listLoading = false;
                    });
            },
            getProductTypes() {
                //加载
                this.listLoading = true;
                //异步请求:
                this.$http.get("/aigou/product/productType/treeData")
                    .then(res => {
                        this.listLoading = false;
                        this.productTypes = res.data;
                    })
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let id = row.id;
                    this.$http.delete("/aigou/product/product/" + id)
                        .then((res) => {
                            let {msg, success, object} = res.data;
                            if (!success) {
                                this.$message({
                                    message: msg,
                                    type: 'error'
                                });
                            } else {
                                this.listLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '删除成功',
                                    type: 'success'
                                });
                                this.getProducts();
                            }
                        });
                }).catch(() => {
                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.formVisible = true;
                //回显 要提交后台
                /* if (!row.productExt) {
                     row.productExt = {
                         description: undefined,
                         richContent: undefined
                     }
                 }*/
                this.form = Object.assign({}, row);
                // 打印某个变量的值
                // console.log(JSON.stringify(this.form,null,2))
                //回显缩略图
                this.fileList2.push({
                    "url": this.staticIp + row.logo,
                    "lg": row.logo
                })
            },
            //显示新增界面
            handleAdd: function () {
                this.formVisible = true;
                this.form = {
                    name: '',
                    subName: '',
                    brandId: '',
                    productTypeId: '',
                    productExt: {"description": "", "richContent": ""}
                };
            },
            //编辑
            editSubmit: function () {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        console.log(this.fileList2);
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            let para = Object.assign({}, this.form);
                            this.$http.post("/aigou/product/product/save", para).then((res) => {
                                this.editLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['form'].resetFields();
                                this.formVisible = false;
                                this.getProducts();
                            });
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {ids: ids};
                    batchRemoveUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getProducts();
                    });
                }).catch(() => {

                });
            }
        }, // $(function()) 加载完毕后执行
        mounted() {
            this.getProducts();
            this.getBrands();
            this.getProductTypes();
        }
    }

</script>
<style scoped>
    .stateStyle1 {
        color: red;
    }

    .stateStyle2 {
        color: springgreen;
    }
</style>