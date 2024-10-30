import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Typography,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  Grid2,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
} from "@mui/material";

import GridData from "./GridData.js";

const initialState = {
  sender: "",
  campaign: "",
  recipients: [],
  jobName: "",
  template: "",
  body: "",
};

const EmailSender = () => {
  const [formData, setFormData] = useState(initialState);
  const [senders, setSenders] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [filteredRecipients, setFilteredRecipients] = useState([]);
  const [emailJobs, setEmailJobs] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [value, setValue] = useState("");
  const [jobId, setJobId] = useState();

  const handleRadioChange = (event) => {
    console.log("handleRadioChange", event.target);
    setValue(event.target.value);
  };

  useEffect(() => {
    async function fetchData() {
      const template = await window.electronAPI
        .fetchTemplates()
        .then((data) => data);

      console.log("fetchTemplates returned:", template.recordsets[0][0]);

      const recipient = await window.electronAPI
        .fetchRecipients()
        .then((data) => data);

      console.log("fetchRecipients returned:", recipient.recordsets[0][0]);
      const sender = await window.electronAPI
        .fetchSenders()
        .then((data) => data);

      const campaignTypes = Array.from(
        new Set(recipient.recordsets[0].map((item) => item.Campaign))
      );
      console.log(campaignTypes, "campaign");
      setCampaigns(campaignTypes);

      setSenders(sender.recordsets[0]);
      setRecipients(recipient.recordsets[0]);
      setTemplates(template.recordsets[0]);
      const jobs = await window.electronAPI
        .fetchEmailJobs()
        .then((data) => data);
      console.log(jobs.recordsets[0], "email jobs");
      setEmailJobs(jobs.recordsets[0]);
    }

    fetchData();
  }, []);

  useEffect(() => {
    const groupedByCampaign = recipients.reduce((acc, item) => {
      const campaign = item.Campaign;
      if (!acc[campaign]) {
        acc[campaign] = [];
      }
      acc[campaign].push(item);
      return acc;
    }, {});
    const rec = groupedByCampaign[formData.campaign];
    if (value === "official") {
      const officialCampaigns = rec?.filter((campaign) => campaign.IsOfficial);
      setFilteredRecipients(officialCampaigns);
    } else if (value === "other") {
      const nonOfficialCampaigns = rec?.filter(
        (campaign) => !campaign.IsOfficial
      );

      setFilteredRecipients(nonOfficialCampaigns);
    } else {
      setFilteredRecipients([]);
    }
  }, [formData.campaign, value]);

  //handle change for single select and text fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Updates formData.campaign when a campaign is selected
    }));
  };

  const handleRecipientChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData((prev) => ({
      ...prev,
      recipients: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const handleAdd = async (job) => {
    const response = await window.electronAPI.addJob({
      jobName: formData.jobName,
      emailSenderId: formData.sender,
      emailTemplateId: formData.template,
      recipients: formData.recipients,
    });
    console.log(response, "response");
    if (response.success) {
      setJobId(response.jobId);
      alert("Job added successfully!");
      if (job) {
        const resp = await window.electronAPI.addJobLogs(response.jobId);
        if (resp.success) {
          alert("Email sent successfully!");
        } else {
          alert("Error:", resp.error);
        }
      }
    } else {
      alert(`Error: ${response.message}`);
    }
  };

  const handleAddAndSend = async () => {
    await handleAdd(true);
  };

  return (
    <Grid2>
      <Box
        sx={{
          padding: 3,
          maxWidth: 600,
          margin: "0 auto",
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" mb={3}>
          Email Sender
        </Typography>
        <form>
          <FormControl fullWidth margin="normal">
            <TextField
              id="Name"
              label="Name"
              name="jobName"
              type="text"
              value={formData.jobName}
              onChange={handleChange}
            />
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel id="sender-label">Sender</InputLabel>
            <Select
              labelId="sender-label"
              name="sender"
              value={formData.sender}
              onChange={handleChange}
              label="Sender"
            >
              {senders.map((sender) => (
                <MenuItem key={sender.id} value={sender.Email_Sender_Id}>
                  {sender.Email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="compaign-label">Compaign</InputLabel>
            <Select
              labelId="campaign-label"
              name="campaign" // Change "compaign" to "campaign"
              value={formData.campaign} // Ensure this points to the correct state
              onChange={handleChange}
              label="Campaign"
            >
              {campaigns.map((campaign, index) => (
                <MenuItem key={index} value={campaign}>
                  {campaign}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <Grid2 display="flex" justifyContent="center" alignItems="center">
              <FormLabel id="demo-row-radio-buttons-group-label">
                Type
              </FormLabel>
              <RadioGroup
                sx={{ marginLeft: 10 }}
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={value}
                onChange={handleRadioChange}
              >
                <FormControlLabel
                  sx={{ marginRight: 5 }}
                  value="official"
                  control={<Radio />}
                  label="Official"
                />
                <FormControlLabel
                  value="other"
                  control={<Radio />}
                  label="Other"
                />
              </RadioGroup>
            </Grid2>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="recipients-label">Recipients</InputLabel>
            <Select
              labelId="recipients-label"
              multiple
              name="recipients"
              value={formData.recipients}
              onChange={handleRecipientChange}
              input={
                <OutlinedInput id="select-multiple-chip" label="Recipients" />
              }
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((id) => {
                    const recipient = filteredRecipients.find(
                      (rec) => rec.Email_Recipient_ID === id
                    );
                    return <Chip key={id} label={recipient?.Email || id} />;
                  })}
                </Box>
              )}
            >
              {filteredRecipients.map((recipient) => (
                <MenuItem
                  key={recipient.Email_Recipient_ID}
                  value={recipient.Email_Recipient_ID}
                >
                  {recipient.Email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel id="template-label">Template</InputLabel>
            <Select
              labelId="template-label"
              name="template"
              value={formData.template}
              onChange={handleChange}
              label="Template"
            >
              {templates.map((template) => (
                <MenuItem
                  key={template.Email_Template_Id}
                  value={template.Email_Template_Id}
                >
                  {template.Template_Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={handleAdd}
              sx={{ mr: 1 }}
            >
              save
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddAndSend}
            >
              save & send
            </Button>
          </Box>
        </form>
      </Box>
      {emailJobs.length > 0 && <GridData emailJobs={emailJobs} />}
      {/* <EmailLogs /> */}
    </Grid2>
  );
};

export default EmailSender;
