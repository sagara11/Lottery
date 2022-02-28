contract("FundMe", function (accounts) {
  let ipfsHash = "279b0e8d48c3ad958e4bdcbe2f208474";

  before(async () => {
    medicalRecord = await MedicalRecord.deployed();
    await medicalRecord.addMedicalRecord(accounts[0], ipfsHash, {
      from: accounts[0],
    });
  });

  describe("add new Medical Record and get state of the record", async () => {
    before("add new Medical Record using accounts[0]", async () => {
      expectedState = 0;
      expectedTotalPending = 1;
      expectedIpfsHash = ipfsHash;
    });

    it("The total pending should be equal to 1", async () => {
      const medicalRecordInfo = await medicalRecord.userToMedicalRecords(
        accounts[0]
      );

      assert.equal(
        medicalRecordInfo.totalPending,
        expectedTotalPending,
        "The default state of new medical record should be PENDING"
      );
    });

    it("The new medical record should have pending status", async () => {
      const recordData = await medicalRecord.userToData(accounts[0], 0);

      assert.equal(
        recordData.recordStatus,
        expectedState,
        "The default state of new medical record should be PENDING"
      );
    });

    it("The new medical record should have the same ipfshash", async () => {
      const recordData = await medicalRecord.ipfsToRecordData(ipfsHash);

      assert.equal(
        recordData.ipfsHash,
        expectedIpfsHash,
        "The new medical record should be belonged to account[1"
      );
    });
  });

  describe("Set new state for medical record", async () => {
    before("add new Medical Record using accounts[0]", async () => {
      await medicalRecord.setState(accounts[0], ipfsHash, 1);
      expectedTotalApproved = 1;
      expectedTotalPending = 0;
    });

    it("The new total approved should be equal to 1", async () => {
      const medicalRecordInfo = await medicalRecord.userToMedicalRecords(
        accounts[0]
      );

      assert.equal(
        medicalRecordInfo.totalApproved,
        expectedTotalApproved,
        "The new total approved should be equal to 1"
      );
    });

    it("The new total pending should be equal to 0", async () => {
      const medicalRecordInfo = await medicalRecord.userToMedicalRecords(
        accounts[0]
      );

      assert.equal(
        medicalRecordInfo.totalPending,
        expectedTotalPending,
        "The new total pending should be equal to 0"
      );
    });

    it("The new status should be APPROVED", async () => {
      const recordData = await medicalRecord.ipfsToRecordData(ipfsHash);

      assert.equal(
        recordData.recordStatus,
        expectedTotalApproved,
        "The new state should be APPROVED"
      );
    });
  });

  describe("Get medical record with pre-defined state", async () => {
    before("add new Medical Record using accounts[0]", async () => {
      expectedSize = 1;
      expectedUser = accounts[0];
      expectedTotalApproved = 1;
      expectedStatus = 1;
    });

    it("The query should equal to 1", async () => {
      const tmpArr = await medicalRecord.getMedicalRecord(accounts[0], 1);
      const test = await medicalRecord.userToData(accounts[0], 0);
      assert.equal(
        tmpArr.length,
        expectedSize,
        "The size of array should equal to 1"
      );
    });

    it("The new total medical record approved", async () => {
      const tmpArr = await medicalRecord.getMedicalRecord(accounts[0], 1);
      const recordData = await medicalRecord.ipfsToRecordData(tmpArr[0]);

      assert.equal(
        recordData.recordStatus,
        expectedStatus,
        "The new total medical record approved"
      );
    });
  });
});
