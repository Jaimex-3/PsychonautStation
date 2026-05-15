import { useState } from 'react';
import {
  Button,
  Icon,
  ImageButton,
  Input,
  NoticeBox,
  Section,
  Stack,
} from 'tgui-core/components';
import { classes } from 'tgui-core/react';
import { capitalizeAll, createSearch } from 'tgui-core/string';

import { useBackend } from '../backend';
import { Window } from '../layouts';
import {
  getPsychonautWindowClasses,
  usePsychonautPanelSettings,
} from '../psychonaut/usePanelSettings';
import { getLayoutState, LAYOUT, LayoutToggle } from './common/LayoutToggle';

type StockItem = {
  amount: number;
  free: boolean;
};

type ProductRecord = {
  path: string;
  name: string;
  price: number;
  ref: string;
  category: string;
  colorable: boolean;
  premium: boolean;
  image?: string;
  icon?: string;
  icon_state?: string;
};

type UserData = {
  name: string;
  cash: number;
  job: string;
  department: string;
};

type Category = {
  icon: string;
};

type VendingData = {
  all_products_free: boolean;
  ad: string;
  department: string;
  jobDiscount: number;
  displayed_currency_icon: string;
  displayed_currency_name: string;
  product_records: ProductRecord[];
  coin_records: ProductRecord[];
  hidden_records: ProductRecord[];
  user: UserData;
  stock: Record<string, StockItem>[];
  extended_inventory: boolean;
  access: boolean;
  categories: Record<string, Category>;
};

export const Vending = () => {
  const { data } = useBackend<VendingData>();
  const panelSettings = usePsychonautPanelSettings();

  const {
    all_products_free,
    ad,
    product_records = [],
    coin_records = [],
    hidden_records = [],
    categories,
  } = data;

  const [selectedCategory, setSelectedCategory] = useState(
    Object.keys(categories)[0],
  );

  const [stockSearch, setStockSearch] = useState('');
  const stockSearchFn = createSearch(
    stockSearch,
    (item: ProductRecord) => item.name,
  );

  let inventory: ProductRecord[] = [...product_records, ...coin_records];
  if (data.extended_inventory) {
    inventory = [...inventory, ...hidden_records];
  }

  // Just in case we still have undefined values in the list
  inventory = inventory.filter((item) => !!item);

  if (stockSearch.length >= 2) {
    inventory = inventory.filter(stockSearchFn);
  }

  const filteredCategories = Object.fromEntries(
    Object.entries(categories).filter(([categoryName]) => {
      return inventory.find((product) => {
        if ('category' in product) {
          return product.category === categoryName;
        } else {
          return false;
        }
      });
    }),
  );
  const vendingClassName = classes(
    getPsychonautWindowClasses('Vending', panelSettings),
  );

  return (
    <Window width={431} height={635}>
      <Window.Content className={vendingClassName}>
        <Stack fill vertical className="Vending__layout">
          {!all_products_free && (
            <Stack.Item className="Vending__status">
              <UserDetails />
            </Stack.Item>
          )}
          {ad && (
            <Stack.Item className="Vending__ad">
              <AdSection AdDisplay={ad} />
            </Stack.Item>
          )}
          <Stack.Item grow className="Vending__body">
            <ProductDisplay
              inventory={inventory}
              modernLayout={panelSettings.panelLayoutStyle === 'modern'}
              stockSearch={stockSearch}
              setStockSearch={setStockSearch}
              selectedCategory={selectedCategory}
            />
          </Stack.Item>

          {stockSearch.length < 2 &&
            Object.keys(filteredCategories).length > 1 && (
              <Stack.Item className="Vending__categoryDock">
                <CategorySelector
                  categories={filteredCategories}
                  selectedCategory={selectedCategory!}
                  onSelect={setSelectedCategory}
                />
              </Stack.Item>
            )}
        </Stack>
      </Window.Content>
    </Window>
  );
};

/** Displays user details if an ID is present and the user is on the station */
export const UserDetails = () => {
  const { data } = useBackend<VendingData>();
  const { user } = data;

  return (
    <NoticeBox
      className="Vending__notice Vending__notice--user"
      m={0}
      color={user && 'blue'}
    >
      <Stack align="center">
        <Stack.Item>
          <Icon name="id-card" size={1.5} />
        </Stack.Item>
        <Stack.Item>
          {user
            ? `${user.name || 'Unknown'} | ${user.job}`
            : 'No ID detected! Contact the Head of Personnel.'}
        </Stack.Item>
      </Stack>
    </NoticeBox>
  );
};

const AdSection = (props: { AdDisplay: string }) => {
  const { AdDisplay } = props;

  return (
    <NoticeBox
      className="Vending__notice Vending__notice--ad"
      m={0}
      color={'yellow'}
    >
      <Stack align="center">
        <Stack.Item>{AdDisplay}</Stack.Item>
      </Stack>
    </NoticeBox>
  );
};

/** Displays  products in a section, with user balance at top */
const ProductDisplay = (props: {
  inventory: ProductRecord[];
  modernLayout: boolean;
  stockSearch: string;
  setStockSearch: (search: string) => void;
  selectedCategory: string | null;
}) => {
  const { data } = useBackend<VendingData>();
  const {
    inventory,
    modernLayout,
    stockSearch,
    setStockSearch,
    selectedCategory,
  } = props;
  const {
    stock,
    all_products_free,
    user,
    displayed_currency_icon,
    displayed_currency_name,
  } = data;
  const [toggleLayout, setToggleLayout] = useState(getLayoutState(LAYOUT.Grid));

  return (
    <Section
      className="Vending__products"
      fill
      scrollable
      title="Products"
      buttons={
        !modernLayout && (
          <Stack className="Vending__toolbar">
            {!all_products_free && user && (
              <Stack.Item
                className="Vending__balance"
                fontSize="16px"
                color="green"
              >
                {user?.cash || 0}
                {displayed_currency_name}
                <Icon name={displayed_currency_icon} color="gold" />
              </Stack.Item>
            )}
            <Stack.Item>
              <Input
                className="Vending__search"
                onChange={setStockSearch}
                expensive
                placeholder="Search..."
                value={stockSearch}
              />
            </Stack.Item>
            <LayoutToggle state={toggleLayout} setState={setToggleLayout} />
          </Stack>
        )
      }
    >
      {modernLayout && (
        <Stack className="Vending__productsToolbar">
          {!all_products_free && user && (
            <Stack.Item
              className="Vending__balance"
              fontSize="16px"
              color="green"
            >
              {user?.cash || 0}
              {displayed_currency_name}
              <Icon name={displayed_currency_icon} color="gold" />
            </Stack.Item>
          )}
          <Stack.Item grow>
            <Input
              className="Vending__search"
              onChange={setStockSearch}
              expensive
              placeholder="Search..."
              value={stockSearch}
            />
          </Stack.Item>
          <LayoutToggle state={toggleLayout} setState={setToggleLayout} />
        </Stack>
      )}
      {inventory
        .filter((product) => {
          if (!stockSearch && 'category' in product) {
            return product.category === selectedCategory;
          } else {
            return true;
          }
        })
        .map((product) => (
          <Product
            key={product.path}
            fluid={toggleLayout === LAYOUT.List}
            product={product}
            productStock={stock[product.path]}
          />
        ))}
    </Section>
  );
};

type ProductProps = {
  product: ProductRecord;
  productStock: StockItem;
  fluid: boolean;
};

/**
 * An individual listing for an item.
 */
const Product = (props: ProductProps) => {
  const { act, data } = useBackend<VendingData>();
  const { product, productStock, fluid } = props;
  const { department, jobDiscount, all_products_free, user } = data;

  const colorable = !!product.colorable;
  const free = all_products_free || productStock.free || product.price === 0;
  const discount = !product.premium && department === user?.department;
  const remaining = productStock.amount;
  const redPrice = Math.round(product.price * jobDiscount);
  const disabled =
    remaining === 0 ||
    (!all_products_free && !user) ||
    (!free && (discount ? redPrice : product.price) > user?.cash);

  const baseProps = {
    base64: product.image,
    dmIcon: product.icon,
    dmIconState: product.icon_state,
    asset: ['vending32x32', product.path],
    disabled: disabled,
    tooltipPosition: 'bottom',
    buttons: colorable && (
      <ProductColorSelect disabled={disabled} product={product} fluid={fluid} />
    ),
    product: product,
    colorable: colorable,
    remaining: remaining,
    onClick: () => {
      act('vend', {
        ref: product.ref,
        discountless: !!product.premium,
      });
    },
  };

  const priceProps = {
    discount: discount,
    free: free,
    product: product,
    redPrice: redPrice,
  };

  return fluid ? (
    <ProductList {...baseProps} {...priceProps} />
  ) : (
    <ProductGrid {...baseProps} {...priceProps} />
  );
};

const ProductGrid = (props: any) => {
  const { product, remaining, ...baseProps } = props;
  const { ...priceProps } = props;

  return (
    <ImageButton
      {...baseProps}
      className={classes([
        'Vending__product',
        'Vending__product--grid',
        product.premium && 'Vending__product--premium',
      ])}
      tooltip={capitalizeAll(product.name)}
      buttonsAlt={
        <Stack className="Vending__productMeta" fontSize={0.8}>
          <Stack.Item grow textAlign={'left'}>
            <ProductPrice {...priceProps} />
          </Stack.Item>
          <Stack.Item className="Vending__stock" color={'lightgray'}>
            x{remaining}
          </Stack.Item>
        </Stack>
      }
    >
      {capitalizeAll(product.name)}
    </ImageButton>
  );
};

const ProductList = (props: any) => {
  const { colorable, product, remaining, ...baseProps } = props;
  const { ...priceProps } = props;

  return (
    <ImageButton
      {...baseProps}
      className={classes([
        'Vending__product',
        'Vending__product--list',
        product.premium && 'Vending__product--premium',
      ])}
      fluid
      imageSize={32}
    >
      <Stack className="Vending__productRow" textAlign={'right'} align="center">
        <Stack.Item className="Vending__productName" grow textAlign={'left'}>
          {capitalizeAll(product.name)}
        </Stack.Item>
        <Stack.Item
          className="Vending__stock"
          width={3.5}
          fontSize={0.8}
          color={'rgba(255, 255, 255, 0.5)'}
        >
          {remaining} left
        </Stack.Item>
        <Stack.Item
          className="Vending__priceCell"
          width={3.5}
          style={{ marginRight: !colorable ? '32px' : '' }}
        >
          <ProductPrice {...priceProps} />
        </Stack.Item>
      </Stack>
    </ImageButton>
  );
};

/**
 * In the case of customizable items, ie: shoes,
 * this displays a color wheel button that opens another window.
 */

type ProductColorSelectProps = {
  disabled: boolean;
  product: ProductRecord;
  fluid: boolean;
};

const ProductColorSelect = (props: ProductColorSelectProps) => {
  const { act } = useBackend<VendingData>();
  const { disabled, product, fluid } = props;

  return (
    <Button
      className="Vending__colorButton"
      width={fluid ? '32px' : '20px'}
      icon={'palette'}
      color={'transparent'}
      tooltip={'Change color'}
      style={disabled ? { pointerEvents: 'none', opacity: 0.5 } : {}}
      onClick={() => act('select_colors', { ref: product.ref })}
    />
  );
};

type ProductPriceProps = {
  discount: boolean;
  free: boolean;
  product: ProductRecord;
  redPrice: number;
};

/** The main button to purchase an item. */
const ProductPrice = (props: ProductPriceProps) => {
  const { data } = useBackend<VendingData>();
  const { displayed_currency_name } = data;
  const { discount, free, product, redPrice } = props;
  let standardPrice = `${product.price}`;
  if (free) {
    standardPrice = 'FREE';
  } else if (discount) {
    standardPrice = `${redPrice}`;
  }
  return (
    <Stack.Item className="Vending__price" fontSize={0.85} color={'gold'}>
      {standardPrice}
      {!free && displayed_currency_name}
    </Stack.Item>
  );
};

const CATEGORY_COLORS = {
  Contraband: 'red',
  Premium: 'yellow',
};

const CategorySelector = (props: {
  categories: Record<string, Category>;
  selectedCategory: string;
  onSelect: (category: string) => void;
}) => {
  const { categories, selectedCategory, onSelect } = props;

  return (
    <Section className="Vending__categories">
      {Object.entries(categories).map(([name, category]) => (
        <Button
          className={classes([
            'Vending__categoryButton',
            name === 'Premium' && 'Vending__categoryButton--premium',
            name === 'Contraband' && 'Vending__categoryButton--contraband',
          ])}
          key={name}
          selected={name === selectedCategory}
          color={CATEGORY_COLORS[name]}
          icon={category.icon}
          onClick={() => onSelect(name)}
        >
          {name}
        </Button>
      ))}
    </Section>
  );
};
