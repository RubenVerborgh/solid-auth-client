// @flow
import 'isomorphic-fetch'
import React from 'react'

import type { authResponse } from '../../src/api'

type profile =
  { 'foaf:name': ?{ '@value': string }
  }

export default class PersonalInfo extends React.Component {
  props : authResponse

  defaultProps = {
    session: null,
    fetch: fetch
  }

  state : { profile: profile } = {
    profile: { 'foaf:name': null }
  }

  fetchProfile = (webId: string): Promise<profile> => {
    const { fetch } = this.props
    const query = `
      @prefix foaf http://xmlns.com/foaf/0.1/
      ${webId} { foaf:name }
    `
    return fetch('https://databox.me/,query', { method: 'POST', body: query })
      .then(resp => resp.json())
  }

  saveProfile = (profile: profile): void =>
    this.setState({ profile })

  componentWillReceiveProps (props: authResponse) {
    if (props.session) {
      this.fetchProfile(props.session.webId).then(this.saveProfile)
    }
  }

  render () {
    const { session } = this.props
    const name = this.state.profile['foaf:name'] ? this.state.profile['foaf:name']['@value'] : 'unnamed person'
    return session
      ? <div>
        Hey there, <span>{name}</span>!
        Your WebID is: <a href={session.webId} target='_blank'><code>{session.webId}</code></a>
      </div>
      : null
  }
}
