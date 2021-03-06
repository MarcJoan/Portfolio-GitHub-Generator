import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import RandomProfile from 'random-profile-generator';

import Navigator from './components/Navigator';
import Card from './components/Card';
import Projects from './components/Project';
import Languages from './components/Languages';
import Contact from './components/Contact';
import Edit from './components/Edit';

export default class App extends Component {
	constructor() {
		super();

		const randomProfile = RandomProfile.profile();

		this.state = {
			profile: {
				name: randomProfile.fullName,
				bio: 'Web Developer',
				avatar: randomProfile.avatar,
				email: 'sample@mail.test',
				url: 'https://github.com/MarcJoan',
				company: '@MainCompany',
				location: 'Spain',
				repos_url: '',
			},
			repositories: [
				{
					id: 1,
					name: 'Sample Project Name',
					description: 'Project short description sample',
					url: 'https://github.com/MarcJoan',
					languages_url: null,
					language: 'Javascript',
					stars: '3',
					forks: '1',
				},
				{
					id: 2,
					name: 'Another Project Name',
					description: 'Another short description sample',
					url: 'https://github.com/MarcJoan',
					languages_url: null,
					language: 'HTML',
					stars: '0',
					forks: '0',
				},
				{
					id: 3,
					name: 'This Sample Project Large Name',
					description:
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
					url: 'https://github.com/MarcJoan',
					languages_url: null,
					language: 'Java',
					stars: '24',
					forks: '41',
				},
				{
					id: 4,
					name: 'Another Project Name 2',
					description: 'Another short description sample',
					url: 'https://github.com/MarcJoan',
					languages_url: null,
					language: 'HTML',
					stars: '3',
					forks: '0',
				},
				{
					id: 5,
					name: 'Another Project Name 3',
					description: 'Another short description sample',
					url: 'https://github.com/MarcJoan',
					languages_url: null,
					language: 'HTML',
					stars: '0',
					forks: '1',
				},
			],
			languages: { total: null },
			edited: false,
		};

		this.getGitHubUser = this.getGitHubUser.bind(this);
		this.getRepositoriesFromUser = this.getRepositoriesFromUser.bind(this);
		this.getRepoLanguages = this.getRepoLanguages.bind(this);
		this.colorsEdited = this.colorsEdited.bind(this);
		this.renderColors = this.render.bind(this);
		this.deleteProject = this.deleteProject.bind(this);
	}

	componentDidUpdate() {
		// localStorage.setItem('storage', JSON.stringify(this.state));
	}

	render() {
		return (
			<>
				<Navigator title={'Portfolio'} />
				<Edit
					colorsEdited={this.colorsEdited}
					changeUser={this.getGitHubUser}
				/>
				<main>
					<Card profile={this.state.profile} />
					<Languages
						languages={this.state.languages}
						total={this.state.languages.total}
						renderColors={this.renderColors}
					/>
					<section id='projects' className='projects'>
						{this.state.repositories.map((repository) => (
							<Projects
								key={repository.id}
								project={repository}
								delete={this.deleteProject}
							/>
						))}
					</section>
					<Contact email={this.state.profile.email} />
				</main>
			</>
		);
	}

	doFetch(url, callback) {
		return fetch(url)
			.then((response) => {
				return response.json();
			})
			.then((data) => {
				callback(data);
			})
			.catch((error) => {
				console.log(error);
			});
	}

	getGitHubUser(username) {
		this.doFetch(`https://api.github.com/users/${username}`, (user) => {
			if (user.message) return;
			const profile = {
				id: user.id,
				name: user.name || user.login,
				bio: user.bio,
				avatar: user.avatar_url,
				email: user.email,
				url: user.html_url,
				company: user.company,
				location: user.location,
				repos_url: user.repos_url,
			};
			this.setState({ profile });
			this.getRepositoriesFromUser();
		});
	}

	getRepositoriesFromUser() {
		this.doFetch(this.state.profile.repos_url, (repos) => {
			const repositories = [];
			repos.forEach((rep) => {
				if (rep.fork) return;
				const repo = {
					name: rep.name.replace(/[-_]/g, ' '),
					description: rep.description,
					url: rep.html_url,
					languages_url: rep.languages_url,
					language: rep.language,
					stars: rep.stargazers_count,
					forks: rep.forks_count,
				};
				repositories.push(repo);
				this.getRepoLanguages(repo);
			});
			this.setState({ repositories });
		});
	}

	getRepoLanguages(repo) {
		if (!repo.languages_url) return;
		this.doFetch(repo.languages_url, (langs) => {
			const languages = this.state.languages;
			languages.total += Object.values(langs).reduce((acc, v) => acc + v);
			Object.entries(langs).forEach(([key, value]) => {
				languages[key] = value + languages[key] || value;
			});
			this.setState({ languages });
		});
	}

	colorsEdited() {
		this.setState({ colorsChanged: false });
	}
	renderColors() {
		this.setState({ colorsChanged: true });
	}

	deleteProject(id) {
		const repositories = this.state.repositories.filter((v) => v.id != id);
		this.setState({ repositories });
	}
}
