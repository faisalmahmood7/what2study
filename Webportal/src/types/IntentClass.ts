import moment from 'moment'
import Parse from 'parse'

export type scenario = {
    anfrag:string
    antwort: string
    }
export type IntentClass = {
  id: string
  user:string
  name: string
  scenario:scenario[]

  }

export const blankBlock:  Partial<IntentClass> = {
  user:"",
  name: "",
  scenario:[]
 }


export const Intents = Parse.Object.extend('intents')

export const generateIntent = async (
  
  props: Partial<IntentClass>
): Promise<string> => {
  const curUser = Parse.User.current()
  let initValues = { ...blankBlock, ...props }
  const intent = new Intents()
  try {
    const res = await intent.save(initValues)
    return res.id
  } catch (error) {
    return 'error'
  }
}

// export function generateQuestBlock(props: Partial<QuestBlockProps>) {
//   return { ...blankBlock, ...props }
// }

export const getIntent = async (id: string) => {
  const query = new Parse.Query(Intents)
  try {
    const intent = await query.get(id)
    return intent.attributes
  } catch (error) {
    console.log(error)
    return error
  }
}
