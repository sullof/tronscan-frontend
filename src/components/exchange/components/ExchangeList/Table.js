import React from "react";
import { Table } from 'antd';
import {QuestionMark} from "../../../common/QuestionMark";
import {withRouter} from 'react-router-dom';
import queryString from 'query-string';
import {connect} from "react-redux";
import {getSelectData} from "../../../../actions/exchange";
import { filter, map ,upperFirst} from 'lodash'
import {injectIntl} from "react-intl";
import Lockr from "lockr";
import _ from "lodash";

class ExchangeTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      dataSource: props.dataSource,
      activeIndex:props.activeIndex,
      optional:[],
      optionalBok:false,
    };
  }

  getColumns() {
    let {intl,setCollection} = this.props;
    let { dataSource } = this.state;
    const columns = [{
      title: upperFirst(intl.formatMessage({id: 'pairs'})),
      key: 'first_token_id',
      render: (text, record, index) => {
        return <div>
          <span className="optional-star">
              <span onClick={(ev) => {setCollection(ev,record.exchange_id,index)}}>
                  {
                      record.optionalBok ? <i className="star_red"></i> : <i className="star"></i>
                  }
              </span>
          </span>
          <span className="exchange-abbr-name">{record.exchange_abbr_name}</span>
        </div>
      }
    },
    {
      title: upperFirst(intl.formatMessage({id: 'last_price'})),
      dataIndex: 'price',
      key: 'price',
    }, 
    {
      title:upperFirst(intl.formatMessage({id: 'pairs_change'})),
      dataIndex: 'up_down_percent',
      key: 'up_down_percent',
      render: (text, record, index) => {
        return (
          text.indexOf('-') != -1?
          <span className='col-red'>{text}</span>:
          <span className='col-green'>{text}</span>
        )
      }
    }];

    return (
      <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          rowKey={(record, index) => {
              return index
          }}
          rowClassName={this.setActiveClass}
          onRow={(record) => {
               return {
                   onClick: () => {
                       this.onSetUrl(record)
                   },
                   // onClick: (e) => {
                   //     this.props.setCollection(e,record.exchange_id)
                   // },
              }
          }}
      />
    )
  }


  setActiveClass = (record, index) => {
    return record.exchange_id === this.state.activeIndex ? "exchange-table-row-active": "";
  }
  getData() {
    const parsed = queryString.parse(this.props.location.search).id;
    const {getSelectData } = this.props;
    let { dataSource } = this.state;
    const currentData = filter(dataSource, item => {
      return item.exchange_id == parsed
    })
    // 更新数据
    if(dataSource.length){
        if(!parsed){
            this.onSetUrl(dataSource[0])
        }else{
            getSelectData(currentData[0])
            this.setState({
                activeIndex:currentData[0].exchange_id
            },()=>{

            })
        }
    }


    // 获取选择状态
    map(dataSource, item => {
      if(item.exchange_id == parsed || !parsed){
        item.isCurrent = true
      }
    })
  }

  onSetUrl(record) {
    const {getSelectData} = this.props;
    this.setState({
        activeIndex:record.exchange_id //获取点击行的索引
    },() => {
    })
    this.props.history.push('/exchange?token='+ record.exchange_name+'&id='+record.exchange_id)
    getSelectData(record, true)
     
  }

  componentDidMount() {


  }

  componentDidUpdate(prevProps) {
    let { dataSource,tab } = this.props;

    if ( dataSource.length && prevProps.dataSource.length !== dataSource.length && dataSource[0].exchange_id && prevProps.tab === tab) {
       this.getData()
    }
  }
  componentWillReceiveProps(nextProps) {
      const {getSelectData,setSearchAddId} = this.props;
      this.setState({
          dataSource: nextProps.dataSource,
      });
      if(this.props.searchAddId){
          let record =  _.filter(nextProps.dataSource, (o) => { return o.exchange_id == nextProps.activeIndex; });
          this.props.history.push('/exchange?token='+ record[0].exchange_name+'&id='+record[0].exchange_id)
          getSelectData(record[0],true)
          this.setState({
              activeIndex:nextProps.activeIndex,
          },()=>{
              this.props.setSearchAddId()
          });
      }

      if(this.props.tab !== nextProps.tab){
          this.setState({
              activeIndex:nextProps.activeIndex,
          });
      }
  }

  render() {
    return (
        <div>
            {this.getColumns()}
        </div>
    )
  }
}

function mapStateToProps(state) {
  return {};
}

const mapDispatchToProps = {
  getSelectData,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(injectIntl(ExchangeTable)));

