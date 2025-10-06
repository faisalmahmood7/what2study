import Parse from 'parse'

export type UserType = {
  username: string
  name: string
  role: 'admin' | 'company'
  website: string
  Telefonnummer: string
  logo: string
  kontaktEmail:string
  AllowKontaktEmail:boolean
  AllowKontaktTele:boolean
  monday:string
  tuesday:string
  wednesday:string
  thursday:string
  friday:string
  openAIKey:string
  localModel:boolean
}

type RegisterProps = {
  email: string
  password: string
  name: string
  role: 'company' | 'admin'
}

export const register = async (props: RegisterProps) => {
  const user = new Parse.User()
  const { email, password, name, role } = props
  user.set('username', String(email).toLowerCase())
  user.set('password', password)
  user.set('name', name)
  user.set('role', role)
  user.set('website', '')
  user.set('Telefonnummer', '')
  user.set('logo', '')
  user.set('kontaktEmail', '')
  user.set('AllowKontaktEmail', true)
  user.set('AllowKontaktTele', true)
  user.set('monday', '09:00,17:00')
  user.set('tuesday', '09:00,17:00')
  user.set('wednesday', '09:00,17:00')
  user.set('thursday', '09:00,17:00')
  user.set('friday', '09:00,17:00')
  user.set('openAIKey', '')
  user.set('localModel', true)
 


  if (role !== 'admin') {
    const userACL = new Parse.ACL()
    userACL.setRoleWriteAccess('Administrator', true)
    userACL.setPublicReadAccess(true)
    user.setACL(userACL)
  }

  try {
    await user.signUp()
    return await login(email.toLowerCase(), password)
  } catch (err) {
    return { error: true }
  }
}

export const login = async (email: string, password: string) => {
  try {
    await Parse.User.logIn(email.toLowerCase(), password)
    //window.location.reload()
    return { error: false }
  } catch (err) {
    return { error: true }
  }
}

// Admin updates user
export const adminUpdateUser = async (user: UserType) => {
  const curUser = Parse.User.current()
  if (!curUser) return { error: true }
  const { name, username, website, Telefonnummer, logo, kontaktEmail,AllowKontaktEmail,AllowKontaktTele, monday,tuesday,wednesday,thursday,friday,openAIKey,localModel } = user
  const query = new Parse.Query(Parse.User)
  query.equalTo('username', username)
  const userToUpdate = await query.first()
  if (!userToUpdate) return { error: true }
  userToUpdate.set('name', name)
  userToUpdate.set('username', username)
  userToUpdate.set('website', website)
  userToUpdate.set('Telefonnummer', Telefonnummer)
  userToUpdate.set('logo', logo)
  userToUpdate.set('kontaktEmail', kontaktEmail)
  userToUpdate.set('AllowKontaktEmail', AllowKontaktEmail)
  userToUpdate.set('AllowKontaktTele', AllowKontaktTele)
  userToUpdate.set('monday', monday)
  userToUpdate.set('tuesday', tuesday)
  userToUpdate.set('wednesday', wednesday)
  userToUpdate.set('thursday', thursday)
  userToUpdate.set('friday', friday)
  userToUpdate.set('openAIKey', openAIKey)
  userToUpdate.set('localModel', localModel)
  

  try {
    userToUpdate.save()
    return { error: false }
  } catch (err) {
    return { error: true }
  }
}

//
export const curUser = Parse.Object.extend('_User')


// User updates himself
export const updateUser = async (user: UserType) => {
  const curUser = Parse.User.current()
  if (!curUser) return { error: true }
  const { name, username,website, Telefonnummer, logo, kontaktEmail,AllowKontaktEmail, AllowKontaktTele,  monday,tuesday,wednesday,thursday,friday,openAIKey,localModel } = user
  curUser.set('name', name)
  curUser.set('username', username)
  curUser.set('Telefonnummer', Telefonnummer)
  curUser.set('logo', logo)
  curUser.set('website', website)
  curUser.set('kontaktEmail', kontaktEmail)
  curUser.set('AllowKontaktEmail', AllowKontaktEmail)
  curUser.set('AllowKontaktTele', AllowKontaktTele)
  curUser.set('monday', monday)
  curUser.set('tuesday', tuesday)
  curUser.set('wednesday', wednesday)
  curUser.set('thursday', thursday)
  curUser.set('friday', friday)
  curUser.set('openAIKey', openAIKey)

  curUser.set('localModel', localModel)


  try {
    await curUser.save()
    return { error: false }
  } catch (err) {
    return { error: true }
  }
}

export const getCurrentUser = () => {
  return Parse.User.current()
}

export const logout = async () => {
  await Parse.User.logOut()
  window.location.reload()
}
