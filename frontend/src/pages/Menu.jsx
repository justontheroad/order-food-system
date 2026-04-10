import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, Empty } from 'antd-mobile';
import { categoryApi, productApi } from '../services/api';
import ProductCard from '../components/ProductCard';

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState(null);

  // 加载分类
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getList,
  });
  const categories = categoriesData?.data || [];

  // 加载商品
  const { data: productsData } = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => productApi.getList({ categoryId: activeCategory, pageNum: 1, pageSize: 50 }),
  });
  const products = productsData?.data?.records || [];

  return (
    <div className="menu-page">
      <Tabs
        activeKey={activeCategory?.toString() || 'all'}
        onChange={(key) => setActiveCategory(key === 'all' ? null : parseInt(key))}
      >
        <Tabs.Tab title="全部" key="all" />
        {categories.map((cat) => (
          <Tabs.Tab title={cat.name} key={cat.id.toString()} />
        ))}
      </Tabs>

      <div style={{ padding: '12px' }}>
        {products.length === 0 ? (
          <Empty description="暂无商品" />
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
};

export default Menu;
