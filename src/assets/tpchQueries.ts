const tpchQueries = [
    `lineitem
    .filter(l_shipdate <= '1998-12-01'::date - '90 days'::interval)
    .groupby({l_returnflag, l_linestatus},{sum_qty:=sum(l_quantity), sum_base_price:=sum(l_extendedprice), sum_disc_price:=sum(l_extendedprice * (1 - l_discount)), sum_charge:=sum(l_extendedprice * (1 - l_discount) * (1 + l_tax)), avg_qty:=avg(l_quantity), avg_price:=avg(l_extendedprice), avg_disc:=avg(l_discount),  count_order:=count()})
    .orderby({l_returnflag, l_linestatus})`,
    `let base := '1993-10-01'::date,
    orders
    .filter(o_orderdate >= base && o_orderdate < base + '3 month'::interval)
    .join(customer, c_custkey=o_custkey)
    .join(lineitem.filter(l_returnflag='R'), l_orderkey=o_orderkey)
    .join(nation, c_nationkey=n_nationkey)
    .groupby({c_custkey, c_name, c_acctbal, c_phone, n_name, c_address, c_comment}, {revenue:=sum(l_extendedprice * (1 - l_discount))})
    .orderby({revenue.desc()}, limit:=20)`,
  ];
  
  export default tpchQueries;