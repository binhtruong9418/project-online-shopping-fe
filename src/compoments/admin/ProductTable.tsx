import {Button, Carousel, Image, Input, Pagination, Popconfirm, Select, Space, Table} from "antd";
import {useState} from "react";
import {useQuery} from "react-query";
import DysonApi from "../../axios/DysonApi";
import moment from "moment";
import EditProductModal from "./EditProductModal";
import AddProductModal from "./AddProductModal";
import {toast} from "react-toastify";
import {BiPencil, BiTrash} from "react-icons/bi";


export default function ProductTable(): JSX.Element {
    const [currentEditProduct, setCurrentEditProduct] = useState<any>(null)
    const [isEdit, setIsEdit] = useState<boolean>(false)
    const [isAdd, setIsAdd] = useState<boolean>(false)
    const [dataSearch, setDataSearch] = useState<any>({
        page: 1,
        limit: 10,
        sort: '-createdAt',
        category: undefined,
        name: ""
    });

    const {
        data: listCategory = []
    } = useQuery('getAllCategory',async () => {
        return await DysonApi.getAllCategory()
    })

    const {
        data: listProductData = {},
        isLoading: isLoadingListProduct,
        isError: isErrorListProduct,
        refetch
    } = useQuery(['getAllProduct', dataSearch], ({queryKey}) => DysonApi.getAllProduct(queryKey[1]), {
        refetchOnWindowFocus: false,
    })

    const {items: listProduct = [], count: totalProduct} = listProductData


    const handleDeleteProduct = async (id: string) => {
        try {
            const res = await DysonApi.deleteProductById(id)
            if (res) {
                toast.success('Delete product successfully')
                await refetch()
            }
        } catch (error) {
            toast.error('Delete product failed')
        }
    }

    const columns = [
        {
            title: 'Image',
            dataIndex: 'productImage',
            key: 'productImage',
            render: (productImage: string[]) => {
                return (
                    <Space
                        direction="vertical"
                        style={{
                            width: "100px",
                        }}
                        size="middle">
                        <Carousel dotPosition="bottom">
                            {
                                productImage.map((x, index) => (
                                    <div key={index} style={{justifyContent: 'center', alignItems: 'center'}}>
                                        <Image
                                            src={x}
                                            preview={true}
                                        />
                                    </div>
                                ))
                            }
                        </Carousel>
                    </Space>
                )
            },
            width: 120
        },
        {
            title: 'Name',
            dataIndex: 'productName',
            key: 'productName',
            width: 200
        },
        {
            title: 'Description',
            dataIndex: 'productDescription',
            key: 'productDescription',
            width: 100,
            render: (description: string) => {
                const shortenDesription = description.length > 100
                    ? description.substring(0, 100) + ' ...' : description
                return (
                    <div>
                        {shortenDesription}
                    </div>
                )
            }
        },
        {
            title: 'Category',
            dataIndex: 'productCategory',
            key: 'productCategory',
            width: 120
        },
        {
            title: 'Price',
            dataIndex: 'productPrice',
            key: 'productPrice',
            render: (productPrice: number) => <p>{productPrice}$</p>,
            width: 100
        },
        {
            title: 'Discount',
            dataIndex: 'productDiscount',
            key: 'productDiscount',
            render: (productDiscount: number) => <p>{productDiscount}%</p>,
            width: 100
        },
        {
            title: 'Quantity',
            dataIndex: 'productQuantity',
            key: 'productQuantity',
            render: (productQuantity: number) => <p>{productQuantity}</p>,
            width: 100
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt: string) => <p>{moment(createdAt).format("DD/MM/YYYY")}</p>,
            width: 120
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (

                <Space>
                    <Button
                        type="text"
                        onClick={() => {
                            setCurrentEditProduct(record)
                            setIsEdit(true)
                        }}
                    >
                        <BiPencil/>
                    </Button>
                    <Popconfirm title="Sure to delete" onConfirm={() => handleDeleteProduct(record.key).then()}>
                        <Button type="text" danger>
                            <BiTrash/>
                        </Button>
                    </Popconfirm>
                </Space>
            ),
            width: 100
        }
    ]

    const tableData = listProduct.map((product: any) => {
        return {
            key: product?._id,
            productImage: product?.images,
            productName: product?.name,
            productCategory: product?.category,
            productDescription: product?.description,
            productPrice: product?.price,
            productQuantity: product?.quantity,
            productDiscount: product?.discount,
            createdAt: product?.createdAt,
        }
    })

    if (isErrorListProduct) {
        return <div>Error</div>
    }

    return (
        <div>
            <Button type="primary" className="my-3 ml-3" onClick={() => setIsAdd(true)}>New Product</Button>
            <div className={'ml-3 mb-4'}>
                <Space>
                    <Input
                        placeholder="Search by name"
                        onChange={(e) => {
                            setDataSearch({
                                ...dataSearch,
                                name: e.target.value,
                            })
                        }}
                        style={{width: '300px'}}
                    />
                    <Select
                        placeholder="Select category"
                        style={{width: '200px'}}
                        onChange={(value) => {
                            setDataSearch({
                                ...dataSearch,
                                category: value,
                            })
                        }}
                        value={dataSearch.category}
                    >
                        <Select.Option value={undefined}>All</Select.Option>
                        {
                            listCategory.map((category: any) => (
                                <Select.Option key={category._id} value={category.name}>{category.name}</Select.Option>
                            ))
                        }
                    </Select>
                    <Select
                        placeholder="Sort"
                        style={{width: '150px'}}
                        onChange={(value) => {
                            setDataSearch({
                                ...dataSearch,
                                sort: value,
                            })
                        }}
                        value={dataSearch.sort}
                    >
                        <Select.Option value={'-createdAt'}>Newest</Select.Option>
                        <Select.Option value={'createdAt'}>Oldest</Select.Option>
                        <Select.Option value={'-currentPrice'}>Price: High to Low</Select.Option>
                        <Select.Option value={'currentPrice'}>Price: Low to High</Select.Option>
                    </Select>
                </Space>
            </div>
            <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                bordered
                loading={isLoadingListProduct}
                scroll={{x: '50vw'}}
            />
            <Pagination
                total={totalProduct}
                onChange={(page, pageSize) => {
                    setDataSearch({
                        ...dataSearch,
                        page,
                        limit: pageSize || 10,
                    })
                }}
                current={dataSearch.page}
                pageSize={dataSearch.limit}
                style={{textAlign: 'right', marginTop: 10}}
            />
            {
                isEdit && currentEditProduct &&
                <EditProductModal
                    isVisible={isEdit}
                    setIsVisible={setIsEdit}
                    name={currentEditProduct.productName}
                    description={currentEditProduct.productDescription}
                    category={currentEditProduct.productCategory}
                    price={currentEditProduct.productPrice}
                    quantity={currentEditProduct.productQuantity}
                    images={currentEditProduct.productImage}
                    id={currentEditProduct.key}
                    discount={currentEditProduct.productDiscount}
                    refetchProduct={refetch}
                />
            }
            {
                isAdd &&
                <AddProductModal
                    isVisible={isAdd}
                    setIsVisible={setIsAdd}
                    refetchProduct={refetch}
                />
            }
        </div>
    )
}