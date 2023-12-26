interface StringDict {
   [key: string]: string; // This means all keys are strings and all values are also strings
}

const tpchQueries: StringDict = {
   "TPC-H 1": `lineitem
    .filter(l_shipdate <= '1998-12-01'::date - '90 days'::interval)
    .groupby({l_returnflag, l_linestatus},
       {sum_qty:=sum(l_quantity),
          sum_base_price:=sum(l_extendedprice),
          sum_disc_price:=sum(l_extendedprice * (1 - l_discount)),
          sum_charge:=sum(l_extendedprice * (1 - l_discount) * (1 + l_tax)),
          avg_qty:=avg(l_quantity),
          avg_price:=avg(l_extendedprice),
          avg_disc:=avg(l_discount),
          count_order:=count()
       })
    .orderby({l_returnflag, l_linestatus})`,
   "TPC-H 2": `let min_supplycost_for_part(p_partkey) :=
    partsupp
    .filter(ps_partkey = p_partkey)
    .join(supplier, s_suppkey=ps_suppkey)
    .join(nation, s_nationkey=n_nationkey)
    .join(region.filter(r_name='EUROPE'), n_regionkey=r_regionkey).aggregate(min(ps_supplycost)),
 part
 .filter(condition:=p_size = 15 && p_type.like('%BRASS'))
 .join(partsupp, p_partkey = ps_partkey)
 .join(supplier, s_suppkey = ps_suppkey)
 .join(nation, s_nationkey = n_nationkey)
 .join(region.filter(r_name='EUROPE'), n_regionkey=r_regionkey)
 .filter(ps_supplycost = min_supplycost_for_part(p_partkey))
 .orderby({s_acctbal.desc(), n_name, s_name, p_partkey}, limit:=100)
 .project({s_acctbal, s_name, n_name, p_partkey, p_mfgr, s_address, s_phone, s_comment})`,
   "TPC-H 3": `customer
 .filter(c_mktsegment = 'BUILDING')
 .join(orders.filter(o_orderdate < '1995-03-15'::date), c_custkey = o_custkey)
 .join(lineitem.filter(l_shipdate > '1995-03-15'::date), l_orderkey = o_orderkey)
 .groupby({l_orderkey,o_orderdate,o_shippriority},{revenue:=sum(l_extendedprice * (1 - l_discount))})
 .orderby({revenue.desc(), o_orderdate}, limit:=10)
 .project({l_orderkey, revenue, o_orderdate, o_shippriority})`,
   "TPC-H 4": `orders
 .filter(o_orderdate >= '1993-07-01'::date && o_orderdate < '1993-07-01'::date + '3 month'::interval)
 .join(lineitem.filter(l_commitdate < l_receiptdate), l_orderkey = o_orderkey, type:=exists)
 .groupby({o_orderpriority}, {order_count:=count()})
 .orderby(o_orderpriority)`,
   "TPC-H 5": `customer
 .join(orders.filter(o_orderdate >= '1994-01-01'::date && o_orderdate < '1994-01-01'::date + '1 year'::interval), c_custkey=o_custkey)
 .join(lineitem, l_orderkey=o_orderkey)
 .join(supplier, l_suppkey=s_suppkey)
 .join(nation, s_nationkey=n_nationkey)
 .join(region.filter(r_name='ASIA'), n_regionkey=r_regionkey)
 .groupby({n_name}, {revenue:=sum(l_extendedprice * (1 - l_discount))})
 .orderby({revenue.desc()})
 .project({n_name, revenue})`,
   "TPC-H 6": `lineitem
 .filter(l_shipdate >= '1994-01-01'::date && l_shipdate < '1994-01-01'::date + '1 year'::interval && l_discount.between(0.06 - 0.01, 0.06 + 0.01) && l_quantity<24)
 .aggregate(sum(l_extendedprice * l_discount))`,
   "TPC-H 7": `supplier
 .join(lineitem.filter(l_shipdate.between('1995-01-01'::date, '1996-12-31'::date)), s_suppkey=l_suppkey)
 .join(orders, o_orderkey=l_orderkey)
 .join(customer, c_custkey=o_custkey)
 .join(nation.as(n1), s_nationkey=n1.n_nationkey)
 .join(nation.as(n2), c_nationkey=n2.n_nationkey)
 .filter((n1.n_name = 'FRANCE' && n2.n_name = 'GERMANY') || (n1.n_name = 'GERMANY' && n2.n_name = 'FRANCE'))
 .map({supp_nation:=n1.n_name, cust_nation:=n2.n_name, l_year:=l_shipdate.extract(year), volume:=l_extendedprice * (1 - l_discount)})
 .groupby({supp_nation, cust_nation, l_year}, {revenue:=sum(volume)})
 .orderby({supp_nation, cust_nation, l_year})`,
   "TPC-H 8": `part
 .filter(p_type = 'ECONOMY ANODIZED STEEL')
 .join(lineitem, p_partkey=l_partkey)
 .join(supplier, s_suppkey=l_suppkey)
 .join(orders.filter(o_orderdate.between('1995-01-01'::date, '1996-12-31'::date)), l_orderkey=o_orderkey)
 .join(customer, o_custkey=c_custkey)
 .join(nation.as(n1), c_nationkey=n1.n_nationkey)
 .join(nation.as(n2), s_nationkey=n2.n_nationkey)
 .join(region.filter(r_name='AMERICA'), n1.n_regionkey=r_regionkey)
 .map({o_year:=o_orderdate.extract(year), volume:=l_extendedprice * (1 - l_discount), nation:=n2.n_name})
 .groupby({o_year}, {mkt_share:=sum(case({nation='BRAZIL' => volume}, else:=0))/sum(volume)})
 .orderby({o_year})`,
   "TPC-H 9": `part
 .filter(p_name.like('%green%'))
 .join(lineitem, p_partkey=l_partkey)
 .join(supplier, s_suppkey=l_suppkey)
 .join(partsupp, ps_suppkey=l_suppkey && ps_partkey=l_partkey)
 .join(orders, o_orderkey=l_orderkey)
 .join(nation, s_nationkey=n_nationkey)
 .map({nation:=n_name, o_year:=o_orderdate.extract(year), amount:=l_extendedprice * (1 - l_discount) - ps_supplycost * l_quantity})
 .groupby({nation, o_year}, {sum_profit:=sum(amount)})
 .orderby({nation, o_year.desc()})`,
   "TPC-H 10": `let base := '1993-10-01'::date,
 orders
 .filter(o_orderdate >= base && o_orderdate < base + '3 month'::interval)
 .join(customer, c_custkey=o_custkey)
 .join(lineitem.filter(l_returnflag='R'), l_orderkey=o_orderkey)
 .join(nation, c_nationkey=n_nationkey)
 .groupby({c_custkey, c_name, c_acctbal, c_phone, n_name, c_address, c_comment}, {revenue:=sum(l_extendedprice * (1 - l_discount))})
 .orderby({revenue.desc()}, limit:=20)`,
   "TPC-H 11": `let partsupp_germany := partsupp
 .join(supplier, ps_suppkey=s_suppkey)
 .join(nation.filter(n_name='GERMANY'), s_nationkey=n_nationkey),
partsupp_germany
.groupby(ps_partkey, {value:=sum(ps_supplycost * ps_availqty)})
.filter(value>partsupp_germany.aggregate(sum(ps_supplycost*ps_availqty))*0.0001)
.orderby(value.desc())`,
   "TPC-H 12": `let base := '1994-01-01'::date,
lineitem
.filter(l_commitdate < l_receiptdate && l_shipdate < l_commitdate && l_receiptdate >= base && l_receiptdate < base + '1 year'::interval && l_shipmode.in({'MAIL', 'SHIP'}))
.join(orders, o_orderkey=l_orderkey)
.groupby(l_shipmode, {high_line_count:=sum(case({o_orderpriority = '1-URGENT' || o_orderpriority = '2-HIGH' => 1}, else:=0)), low_line_count:=sum(case({o_orderpriority <> '1-URGENT' && o_orderpriority <> '2-HIGH' => 1}, else:=0))})
.orderby(l_shipmode)`,
   "TPC-H 13": `customer
.join(orders.filter(!o_comment.like('%special%requests%')), c_custkey=o_custkey, type:=leftouter)
.groupby({c_custkey}, {c_count:=count(o_orderkey)})
.groupby({c_count}, {custdist:=count()})
.orderby({custdist.desc(), c_count.desc()})`,
   "TPC-H 14": `let base:='1995-09-01'::date,
lineitem
.filter(l_shipdate >= base && l_shipdate < base + '1 month'::interval)
.join(part, l_partkey=p_partkey)
.aggregate(100.00*sum(case({p_type.like('PROMO%') => l_extendedprice * (1 - l_discount)}, else:=0)) / sum(l_extendedprice * (1 - l_discount)))`,
   "TPC-H 15": `let base := '1996-01-01'::date,
let revenue:=
   lineitem
   .filter(l_shipdate >= base && l_shipdate < base + '3 month'::interval)
   .groupby(l_suppkey, {total_revenue:=sum(l_extendedprice * (1 - l_discount))})
   .project({supplier_no:=l_suppkey, total_revenue}),
supplier
.join(revenue, s_suppkey = supplier_no)
.filter(total_revenue=revenue.aggregate(max(total_revenue)))
.orderby({s_suppkey})
.project({s_suppkey, s_name, s_address, s_phone, total_revenue})`,
   "TPC-H 16": `part
.filter(p_brand <> 'Brand#45' && !p_type.like('MEDIUM POLISHED%') && p_size.in({49, 14, 23, 45, 19, 3, 36, 9}))
.join(partsupp, p_partkey=ps_partkey)
.join(supplier.filter(s_comment.like('%Customer%Complaints%')), ps_suppkey=s_suppkey, type:=leftanti)
.groupby({p_brand, p_type, p_size}, {supplier_cnt:=count(ps_suppkey, distinct:=true)})
.orderby({supplier_cnt.desc(), p_brand, p_type, p_size})`,
   "TPC-H 17": `let avg_for_part(p_partkey) :=
lineitem.filter(l_partkey=p_partkey).aggregate(0.2*avg(l_quantity)),
part
.filter(p_brand = 'Brand#23' && p_container = 'MED BOX')
.join(lineitem, p_partkey=l_partkey)
.filter(l_quantity < avg_for_part(p_partkey))`,
   "TPC-H 18": `customer
.join(orders, c_custkey=o_custkey)
.join(lineitem.groupby({l_orderkey}, {s:=sum(l_quantity)}).filter(s>300), o_orderkey=l_orderkey, type:=leftsemi)
.join(lineitem, o_orderkey=l_orderkey)
.groupby({c_name, c_custkey, o_orderkey, o_orderdate, o_totalprice}, {s:=sum(l_quantity)})
.orderby({o_totalprice.desc(), o_orderdate}, limit:=100)`,
   "TPC-H 19": `lineitem
.filter(l_shipmode.in({'AIR', 'AIR REG'}) && l_shipinstruct = 'DELIVER IN PERSON')
.join(part, p_partkey=l_partkey)
.filter(
   (p_brand = 'Brand#12' && p_container.in({'SM CASE', 'SM BOX', 'SM PACK', 'SM PKG'}) && l_quantity.between(1,1+10) && p_size.between(1,5))
|| (p_brand = 'Brand#23' && p_container.in({'MED BAG', 'MED BOX', 'MED PKG', 'MED PACK'}) && l_quantity.between(10,10+10) && p_size.between(1,10))
|| (p_brand = 'Brand#34' && p_container.in({'LG CASE', 'LG BOX', 'LG PACK', 'LG PKG'}) && l_quantity.between(20,20+10) && p_size.between(1,15)))
.aggregate(sum(l_extendedprice* (1 - l_discount)))`,
   "TPC-H 20": `let base := '1994-01-01'::date,
let qty_per_ps(ps_partkey, ps_suppkey) :=
   lineitem
   .filter(l_partkey = ps_partkey && l_suppkey = ps_suppkey && l_shipdate >= base && l_shipdate < base + '1 year'::interval)
   .aggregate(sum(l_quantity)),
let avail :=
   partsupp
   .join(part.filter(p_name.like('forest%')), ps_partkey=p_partkey, type:=leftsemi)
   .filter(ps_availqty > 0.5*qty_per_ps(ps_partkey, ps_suppkey))
   .project(ps_suppkey),
supplier
.join(nation.filter(n_name='CANADA'), s_nationkey=n_nationkey)
.join(avail, s_suppkey=ps_suppkey, type:=leftsemi)
.orderby({s_name})
.project({s_name, s_address})`,
"TPC-H 21": `supplier
.join(lineitem.filter(l_receiptdate>l_commitdate).as(l1), s_suppkey=l1.l_suppkey)
.join(orders.filter(o_orderstatus = 'F'), o_orderkey = l1.l_orderkey)
.join(nation.filter(n_name = 'SAUDI ARABIA'), s_nationkey = n_nationkey)
.join(lineitem.as(l2), l2.l_orderkey = l1.l_orderkey && l2.l_suppkey <> l1.l_suppkey, type:=leftsemi)
.join(lineitem.as(l3), l3.l_orderkey = l1.l_orderkey && l3.l_suppkey <> l1.l_suppkey && l3.l_receiptdate > l3.l_commitdate, type:=leftanti)
.groupby({s_name}, {numwait:=count()})
.orderby({numwait.desc(), s_name}, limit:=100)`,
   "TPC-H 22": `let avg_for_selected :=
customer
.filter(c_acctbal > 0.00 && c_phone.substr(1,2).in({'13', '31', '23', '29', '30', '18', '17'}))
.aggregate(avg(c_acctbal)),
customer
.map({cntrycode:=c_phone.substr(1,2)})
.filter(cntrycode.in({'13', '31', '23', '29', '30', '18', '17'}) && c_acctbal > avg_for_selected)
.join(orders, o_custkey=c_custkey, type:=leftanti)
.groupby({cntrycode}, {numcust:=count(), totacctbal:=sum(c_acctbal)})
.orderby({cntrycode})`,
"FOREIGN-FEATURE": `let date(spec, modifier expression := '+0 seconds') := foreigncall('date', date, {spec, modifier}),
let concat(string1, string2, string3 := "") := foreigncall('||', text, {string1, string2, string3}, type := operator),
orders
.filter(o_orderdate < date('1995-03-15', '+10 days'))
.map({txt := concat(o_orderstatus, ' comment: ', o_comment)})
.orderby({o_orderdate.desc()}, limit:=10)
.project({o_orderkey, o_orderdate, txt})`,
"GENSYM-FEATURE": `let semijoin(preserve table, probe table, p expression, x symbol := gensym(x), y symbol :=gensym(y)) :=
   preserve
   .window({x:=row_number()})
   .alias(y)
   .join(probe, p)
   .project({y})
   .distinct()
   .projectout({x}),
semijoin(nation, region.filter(r_name='ASIA'), n_regionkey=r_regionkey)`,
"ISIDENTICAL-FEATURE": `let isidentical(t1 table, t2 table) :=
   t1.except(t2, all:=true).union(t2.except(t1, all:=true)).aggregate(count())=0,
isidentical(nation.filter(n_nationkey<100), nation)`,
"TABLE-FEATURE": `table({{a:=1,b:=2},{3,4}})`
};

export default tpchQueries;