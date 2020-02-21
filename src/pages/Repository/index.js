import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaFilter, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, Filter, IssuePagination } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filterSelected: 'all',
    currentPage: 1,
  };

  componentDidMount() {
    this.fetchGitData();
  }

  handleFilterChange = async e => {
    console.log(e.target.value);
    await this.setState({
      filterSelected: e.target.value,
      loading: true,
      currentPage: 1,
    });
    this.fetchGitData();
  };

  async fetchGitData() {
    const { match } = this.props;
    const { filterSelected, currentPage } = this.state;
    console.log(filterSelected);

    const propName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${propName}`),
      api.get(`/repos/${propName}/issues`, {
        params: {
          state: filterSelected,
          per_page: 5,
          page: currentPage,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handlePagination = async goToPage => {
    console.log(goToPage);
    await this.setState({ currentPage: goToPage });
    this.fetchGitData();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filterSelected,
      currentPage,
    } = this.state;

    if (loading) {
      return <Loading> Carregando </Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/"> Voltar aos repositórios </Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <Filter>
            <div>
              <FaFilter color="#000" size={14} />
              <select
                name="issueFilter"
                id="issueFilter"
                onChange={this.handleFilterChange}
              >
                <option value="all" selected={filterSelected === 'all'}>
                  All
                </option>
                <option value="open" selected={filterSelected === 'open'}>
                  Open
                </option>
                <option value="closed" selected={filterSelected === 'closed'}>
                  Closed
                </option>
              </select>
            </div>
          </Filter>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}> {issue.title} </a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}> {label.name} </span>
                  ))}
                </strong>
                <p> {issue.user.login} </p>
              </div>
            </li>
          ))}
        </IssueList>
        <IssuePagination>
          <button
            disabled={currentPage === 1}
            onClick={() => this.handlePagination(currentPage - 1)}
          >
            <FaArrowLeft />
          </button>
          <button onClick={() => this.handlePagination(currentPage + 1)}>
            <FaArrowRight />
          </button>
        </IssuePagination>
      </Container>
    );
  }
}
