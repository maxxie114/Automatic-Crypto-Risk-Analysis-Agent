import agentLog from '../schema/agentLogs'
import analysis from '../schema/analysis'
import blockedTx from '../schema/blockedTx'
import coin from '../schema/coin'
import coinList from '../schema/coinList'
import risk from '../schema/risk'

export const schemaTypes = [coin, coinList, analysis, risk, blockedTx, agentLog]
