/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';
import classNames from 'classnames';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

function getUserByCategory(ownerId) {
  return usersFromServer.find(user => user.id === ownerId);
}

function getCategoryByCategory(categoryId) {
  return categoriesFromServer.find(category => category.id === categoryId);
}

const products = productsFromServer.map((product) => {
  const category = getCategoryByCategory(product.categoryId);
  const user = getUserByCategory(category.ownerId);

  return {
    ...product,
    user,
    category,
  };
});

const FILTER_BY_ALL = {
  name: 'All',
  id: 0,
};

function getPreparedProducts(inComeProducts, options) {
  let productsCopy = [...inComeProducts];
  const { byUser, byQuerry, byCategory } = options;

  if (byUser.id !== FILTER_BY_ALL.id) {
    productsCopy = productsCopy.filter(
      product => product.user.id === byUser.id,
    );
  }

  if (byQuerry) {
    const clearedQerry = byQuerry.trim().toLowerCase();

    productsCopy = productsCopy.filter(
      product => product.name.toLowerCase().includes(clearedQerry),
    );
  }

  if (byCategory.length > 0) {
    productsCopy = productsCopy.filter(
      product => byCategory.includes(product.categoryId),
    );
  }

  return productsCopy;
}

export const App = () => {
  const [filterByUser, setFilterByUser] = useState(FILTER_BY_ALL);
  const [filterByQuerry, setFilterByQuerry] = useState('');
  const [filterByCategory, setFilterByCategory] = useState([]);

  function handleFilterByUser(userId) {
    setFilterByUser(userId);
  }

  function handleFilterByCategory(category) {
    if (filterByCategory.includes(category.id)) {
      const splicedArr = [...filterByCategory];

      splicedArr.splice(splicedArr.indexOf(category.id), 1);

      setFilterByCategory(splicedArr);
    } else {
      setFilterByCategory([...filterByCategory, category.id]);
    }
  }

  const preparedProducts = getPreparedProducts(products, {
    byUser: filterByUser,
    byQuerry: filterByQuerry,
    byCategory: filterByCategory,
  });

  function resetFilters() {
    setFilterByUser(FILTER_BY_ALL);
    setFilterByQuerry('');
    setFilterByCategory([]);
  }

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <Users
              users={usersFromServer}
              selectedUser={filterByUser}
              // eslint-disable-next-line react/jsx-no-bind
              handleUser={handleFilterByUser}
            />

            {/* search region */}

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={filterByQuerry}
                  onChange={event => setFilterByQuerry(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                <span className="icon is-right">
                  {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                  {filterByQuerry && (
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setFilterByQuerry('')}
                    />
                  )}
                </span>
              </p>
            </div>

            {/* category filter region */}

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={classNames('button is-success mr-6', {
                  'is-outlined': filterByCategory.length !== 0,
                })}
                onClick={() => setFilterByCategory([])}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  data-cy="Category"
                  className={classNames('button mr-2 my-1', {
                    'is-info': filterByCategory.includes(category.id),
                  })}
                  href="#/"
                  onClick={() => handleFilterByCategory(category)}
                  key={category.id}
                >
                  {category.title}
                </a>
              ))}
            </div>

            {/* reset region */}

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => resetFilters()}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <Products productsList={preparedProducts} />

      </div>
    </div>
  );
};

const Products = (props) => {
  const { productsList } = props;
  const productsListEmpty = productsList.length === 0;

  return (
    <div className="box table-container">
      {productsListEmpty && (
        <p data-cy="NoMatchingMessage">
          No products matching selected criteria
        </p>
      )}

      {!productsListEmpty && (
        <table
          data-cy="ProductTable"
          className="table is-striped is-narrow is-fullwidth"
        >
          <thead>
            <tr>
              <th>
                <span className="is-flex is-flex-wrap-nowrap">
                  ID

                  <a href="#/">
                    <span className="icon">
                      <i data-cy="SortIcon" className="fas fa-sort" />
                    </span>
                  </a>
                </span>
              </th>

              <th>
                <span className="is-flex is-flex-wrap-nowrap">
                  Product

                  <a href="#/">
                    <span className="icon">
                      <i data-cy="SortIcon" className="fas fa-sort-down" />
                    </span>
                  </a>
                </span>
              </th>

              <th>
                <span className="is-flex is-flex-wrap-nowrap">
                  Category

                  <a href="#/">
                    <span className="icon">
                      <i data-cy="SortIcon" className="fas fa-sort-up" />
                    </span>
                  </a>
                </span>
              </th>

              <th>
                <span className="is-flex is-flex-wrap-nowrap">
                  User

                  <a href="#/">
                    <span className="icon">
                      <i data-cy="SortIcon" className="fas fa-sort" />
                    </span>
                  </a>
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {productsList.map(
              product => <Product product={product} key={product.id} />,
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

const Product = (props) => {
  const { product } = props;
  const { user } = product;
  const { category } = product;

  return (
    <tr data-cy="Product">
      <td className="has-text-weight-bold" data-cy="ProductId">
        {product.id}
      </td>

      <td data-cy="ProductName">{product.name}</td>
      <td data-cy="ProductCategory">{`${category.icon} - ${category.title}`}</td>

      <td
        data-cy="ProductUser"
        className={classNames({
          'has-text-link': user.sex === 'm',
          'has-text-danger': user.sex === 'f',
        })}
      >
        {user.name}
      </td>
    </tr>
  );
};

const Users = (props) => {
  const { users, selectedUser, handleUser } = props;

  return (
    <p className="panel-tabs has-text-weight-bold">
      <User
        user={{ name: 'All', id: 0 }}
        key={0}
        selectedUser={selectedUser}
        onSelect={handleUser}
      />

      {users.map(
        user => (
          <User
            user={user}
            key={user.id}
            selectedUser={selectedUser}
            onSelect={handleUser}
          />
        ),
      )}
    </p>
  );
};

const User = (props) => {
  const { user, selectedUser, onSelect } = props;

  return (
    <a
      data-cy="FilterUser"
      href="#/"
      onClick={() => onSelect(user)}
      className={classNames({ 'is-active': user.id === selectedUser.id })}
    >
      {user.name}
    </a>
  );
};
